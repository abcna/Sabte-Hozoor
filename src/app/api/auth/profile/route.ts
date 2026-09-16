import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { jsonError, requireUser, toPublicUser } from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/validations";

export async function PUT(req: Request) {
  const user = await requireUser();
  if (!user) return jsonError("ابتدا وارد شوید.", 401);

  try {
    const body = await req.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message || "اطلاعات پروفایل نامعتبر است.";
      return jsonError(message);
    }

    const { phone, shiftId, password } = parsed.data;
    const nextPassword = password?.trim() ?? "";

    if (shiftId) {
      const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
      if (!shift) return jsonError("شیفت انتخاب‌شده معتبر نیست.");
    }

    if (
      phone === undefined &&
      shiftId === undefined &&
      !nextPassword
    ) {
      return jsonError("تغییری برای ذخیره ارسال نشده است.");
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(phone !== undefined ? { phone: phone.trim() } : {}),
        ...(shiftId !== undefined
          ? shiftId
            ? { shift: { connect: { id: shiftId } } }
            : { shift: { disconnect: true } }
          : {}),
        ...(nextPassword
          ? {
              passwordHash: await hash(nextPassword, 10),
              passwordSet: true,
            }
          : {}),
      },
      include: { location: true, shift: true },
    });

    return NextResponse.json({
      ok: true,
      message: "پروفایل با موفقیت ذخیره شد.",
      user: toPublicUser(updated),
    });
  } catch (error) {
    console.error("profile update error", error);
    return jsonError("ذخیره پروفایل ناموفق بود.", 500);
  }
}
