import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireUser } from "@/lib/auth";

/** Authenticated users can list shifts to complete their profile. */
export async function GET() {
  const user = await requireUser();
  if (!user) return jsonError("دسترسی غیرمجاز.", 401);

  const shifts = await prisma.shift.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, startTime: true, endTime: true },
  });

  return NextResponse.json({ ok: true, shifts });
}
