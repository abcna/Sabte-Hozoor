import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("دسترسی غیرمجاز.", 401);

  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const userId = searchParams.get("userId");

  const records = await prisma.attendanceRecord.findMany({
    where: {
      ...(userId ? { userId } : {}),
      ...(from || to
        ? {
            recordedAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    select: {
      id: true,
      type: true,
      recordedAt: true,
      distanceMeters: true,
      photoMime: true,
      user: { select: { id: true, name: true, username: true } },
      location: { select: { id: true, name: true } },
    },
    orderBy: { recordedAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    ok: true,
    records: records.map(({ photoMime, ...r }) => ({
      ...r,
      hasPhoto: Boolean(photoMime),
    })),
  });
}
