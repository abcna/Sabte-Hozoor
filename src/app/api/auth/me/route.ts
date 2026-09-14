import { NextResponse } from "next/server";
import { jsonError, requireUser, toPublicUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  if (!user) return jsonError("دسترسی غیرمجاز.", 401);
  return NextResponse.json({ ok: true, user: toPublicUser(user) });
}
