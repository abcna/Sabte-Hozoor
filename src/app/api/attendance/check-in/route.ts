import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireUser } from "@/lib/auth";
import { checkInSchema, splitDataUrl } from "@/lib/validations";
import { haversineDistanceMeters, isWithinRadius } from "@/lib/geo";
import { hasOpenCheckInToday } from "@/lib/attendance";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!user) return jsonError("دسترسی غیرمجاز.", 401);

    if (!user.locationId || !user.location) {
      return jsonError("لوکیشن برای شما تعریف نشده است.");
    }

    const body = await req.json();
    const parsed = checkInSchema.safeParse(body);
    if (!parsed.success) {
      const msg =
        parsed.error.issues[0]?.message || "مختصات و عکس سلفی الزامی است.";
      return jsonError(msg);
    }

    const { latitude, longitude, photoDataUrl } = parsed.data;
    const distance = haversineDistanceMeters(
      latitude,
      longitude,
      user.location.latitude,
      user.location.longitude,
    );

    if (!isWithinRadius(distance, user.location.radiusMeters)) {
      return NextResponse.json(
        {
          ok: false,
          code: "OUT_OF_RANGE",
          message: "باید حتماً در داروخانه حاضر باشید.",
          distanceMeters: Math.round(distance),
          allowedRadiusMeters: user.location.radiusMeters,
        },
        { status: 403 },
      );
    }

    const alreadyIn = await hasOpenCheckInToday(user.id);
    if (alreadyIn) {
      return jsonError("قبلاً ورود ثبت شده است.");
    }

    const { mime, base64 } = splitDataUrl(photoDataUrl);

    const record = await prisma.attendanceRecord.create({
      data: {
        userId: user.id,
        locationId: user.location.id,
        type: "check_in",
        clientLatitude: latitude,
        clientLongitude: longitude,
        distanceMeters: distance,
        photoBase64: base64,
        photoMime: mime,
      },
      select: {
        id: true,
        type: true,
        recordedAt: true,
        distanceMeters: true,
      },
    });

    return NextResponse.json({ ok: true, record });
  } catch (error) {
    console.error("check-in error", error);
    return jsonError("ثبت ورود ناموفق بود.", 500);
  }
}
