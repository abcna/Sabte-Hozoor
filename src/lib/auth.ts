import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { prisma } from "./db";

export const SESSION_COOKIE = "attendance_session";
const SESSION_DAYS = 7;

export type SessionPayload = {
  userId: string;
  role: Role;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as unknown as SessionPayload;
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      location: true,
      shift: true,
    },
  });

  if (!user || !user.isActive) return null;
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, message, ...extra }, { status });
}

export function toPublicUser(user: {
  id: string;
  name: string;
  username: string;
  phone: string;
  role: Role;
  isActive: boolean;
  locationId: string | null;
  shiftId: string | null;
  location: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
    address: string | null;
  } | null;
  shift: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  } | null;
}) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    locationId: user.locationId,
    shiftId: user.shiftId,
    location: user.location
      ? {
          id: user.location.id,
          name: user.location.name,
          latitude: user.location.latitude,
          longitude: user.location.longitude,
          radiusMeters: user.location.radiusMeters,
          address: user.location.address,
        }
      : null,
    shift: user.shift
      ? {
          id: user.shift.id,
          name: user.shift.name,
          startTime: user.shift.startTime,
          endTime: user.shift.endTime,
        }
      : null,
  };
}
