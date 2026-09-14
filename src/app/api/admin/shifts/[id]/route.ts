import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/auth";
import { shiftSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("دسترسی غیرمجاز.", 401);

  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = shiftSchema.safeParse(body);
    if (!parsed.success) return jsonError("اطلاعات شیفت نامعتبر است.");

    const shift = await prisma.shift.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ ok: true, shift });
  } catch {
    return jsonError("بروزرسانی شیفت ناموفق بود.", 500);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("دسترسی غیرمجاز.", 401);

  const { id } = await params;
  try {
    await prisma.shift.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("حذف شیفت ناموفق بود.", 500);
  }
}
