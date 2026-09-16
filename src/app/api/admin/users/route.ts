import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/auth";
import { userCreateSchema } from "@/lib/validations";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return jsonError("دسترسی غیرمجاز.", 401);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { location: true, shift: true },
  });

  return NextResponse.json({
    ok: true,
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      phone: u.phone,
      role: u.role,
      isActive: u.isActive,
      locationId: u.locationId,
      shiftId: u.shiftId,
      location: u.location,
      shift: u.shift,
      createdAt: u.createdAt,
    })),
  });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("دسترسی غیرمجاز.", 401);

  try {
    const body = await req.json();
    const parsed = userCreateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("اطلاعات کاربر نامعتبر است.");
    }

    const data = parsed.data;
    const existing = await prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existing) return jsonError("این نام کاربری قبلاً ثبت شده است.");

    // Password is optional at create time — employees set it via تکمیل پروفایل.
    const hasPassword = !!(data.password && data.password.length >= 4);
    const rawPassword = hasPassword
      ? data.password!
      : `unset-${crypto.randomUUID()}`;
    const passwordHash = await hash(rawPassword, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        passwordHash,
        passwordSet: hasPassword,
        phone: (data.phone ?? "").trim(),
        role: data.role,
        locationId: data.locationId || null,
        shiftId: data.shiftId || null,
        isActive: data.isActive,
      },
      include: { location: true, shift: true },
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (error) {
    console.error("create user", error);
    return jsonError("ایجاد کاربر ناموفق بود.", 500);
  }
}
