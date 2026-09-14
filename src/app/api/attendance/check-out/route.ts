import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireUser } from "@/lib/auth";
import { coordsSchema } from "@/lib/validations";
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
    const parsed = coordsSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("مختصات معتبر الزامی است.");
    }

    const { latitude, longitude } = parsed.data;
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

    const open = await hasOpenCheckInToday(user.id);
    if (!open) {
      return jsonError("ابتدا ورود را ثبت کنید.");
    }

    const record = await prisma.attendanceRecord.create({
      data: {
        userId: user.id,
        locationId: user.location.id,
        type: "check_out",
        clientLatitude: latitude,
        clientLongitude: longitude,
        distanceMeters: distance,
      },
    });

    return NextResponse.json({ ok: true, record });
  } catch (error) {
    console.error("check-out error", error);
    return jsonError("ثبت خروج ناموفق بود.", 500);
  }
}
