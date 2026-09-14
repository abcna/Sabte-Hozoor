import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";
import {
  createSessionToken,
  setSessionCookie,
  toPublicUser,
  jsonError,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("نام کاربری و رمز عبور الزامی است.");
    }

    const { username, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { username },
      include: { location: true, shift: true },
    });

    if (!user || !user.isActive) {
      return jsonError("نام کاربری یا رمز عبور اشتباه است.", 401);
    }

    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      return jsonError("نام کاربری یا رمز عبور اشتباه است.", 401);
    }

    const token = await createSessionToken({
      userId: user.id,
      role: user.role,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error("login error", error);
    return jsonError("ورود ناموفق بود.", 500);
  }
}
