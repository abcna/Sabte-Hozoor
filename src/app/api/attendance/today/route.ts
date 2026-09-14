import { NextResponse } from "next/server";
import { startOfDay, endOfDay } from "date-fns";
import { prisma } from "@/lib/db";
import { jsonError, requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  if (!user) return jsonError("دسترسی غیرمجاز.", 401);

  const now = new Date();
  const from = startOfDay(now);
  const to = endOfDay(now);

  const records = await prisma.attendanceRecord.findMany({
    where: {
      userId: user.id,
      recordedAt: { gte: from, lte: to },
    },
    orderBy: { recordedAt: "asc" },
  });

  let status: "not_checked_in" | "on_site" | "checked_out" = "not_checked_in";
  let lastCheckIn: (typeof records)[number] | null = null;
  let lastCheckOut: (typeof records)[number] | null = null;

  for (const r of records) {
    if (r.type === "check_in") {
      status = "on_site";
      lastCheckIn = r;
    }
    if (r.type === "check_out") {
      status = "checked_out";
      lastCheckOut = r;
    }
  }

  return NextResponse.json({
    ok: true,
    status,
    records,
    lastCheckIn,
    lastCheckOut,
  });
}
