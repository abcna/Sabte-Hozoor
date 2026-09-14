import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/auth";
import { shiftSchema } from "@/lib/validations";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return jsonError("دسترسی غیرمجاز.", 401);

  const shifts = await prisma.shift.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, shifts });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("دسترسی غیرمجاز.", 401);

  try {
    const body = await req.json();
    const parsed = shiftSchema.safeParse(body);
    if (!parsed.success) return jsonError("اطلاعات شیفت نامعتبر است.");

    const shift = await prisma.shift.create({ data: parsed.data });
    return NextResponse.json({ ok: true, shift }, { status: 201 });
  } catch {
    return jsonError("ایجاد شیفت ناموفق بود.", 500);
  }
}
