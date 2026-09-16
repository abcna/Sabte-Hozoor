import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/auth";
import { userUpdateSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("دسترسی غیرمجاز.", 401);

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { location: true, shift: true },
  });
  if (!user) return jsonError("کاربر پیدا نشد.", 404);

  const { passwordHash: _, ...safe } = user;
  return NextResponse.json({ ok: true, user: safe });
}

export async function PUT(req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("دسترسی غیرمجاز.", 401);

  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = userUpdateSchema.safeParse(body);
    if (!parsed.success) return jsonError("اطلاعات کاربر نامعتبر است.");

    const data = parsed.data;
    if (data.username) {
      const clash = await prisma.user.findFirst({
        where: { username: data.username, NOT: { id } },
      });
      if (clash) return jsonError("این نام کاربری قبلاً ثبت شده است.");
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.username !== undefined ? { username: data.username } : {}),
        ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
        ...(data.role !== undefined ? { role: data.role } : {}),
        ...(data.locationId !== undefined ? { locationId: data.locationId } : {}),
        ...(data.shiftId !== undefined ? { shiftId: data.shiftId } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.password
          ? {
              passwordHash: await hash(data.password, 10),
              passwordSet: true,
            }
          : {}),
      },
      include: { location: true, shift: true },
    });

    const { passwordHash: _, ...safe } = user;
    return NextResponse.json({ ok: true, user: safe });
  } catch (error) {
    console.error("update user", error);
    return jsonError("بروزرسانی کاربر ناموفق بود.", 500);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("دسترسی غیرمجاز.", 401);

  const { id } = await params;
  if (id === admin.id) return jsonError("نمی‌توانید حساب خودتان را حذف کنید.");

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("حذف کاربر ناموفق بود.", 500);
  }
}
