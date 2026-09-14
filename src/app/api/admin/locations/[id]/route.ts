import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/auth";
import { locationSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("دسترسی غیرمجاز.", 401);

  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = locationSchema.safeParse(body);
    if (!parsed.success) return jsonError("اطلاعات لوکیشن نامعتبر است.");

    const location = await prisma.location.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ ok: true, location });
  } catch {
    return jsonError("بروزرسانی لوکیشن ناموفق بود.", 500);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("دسترسی غیرمجاز.", 401);

  const { id } = await params;
  try {
    await prisma.location.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("حذف لوکیشن ناموفق بود.", 500);
  }
}
