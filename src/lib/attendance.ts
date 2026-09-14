import { startOfDay, endOfDay } from "date-fns";
import { prisma } from "@/lib/db";

export async function hasOpenCheckInToday(userId: string) {
  const now = new Date();
  const from = startOfDay(now);
  const to = endOfDay(now);

  const records = await prisma.attendanceRecord.findMany({
    where: {
      userId,
      recordedAt: { gte: from, lte: to },
    },
    orderBy: { recordedAt: "asc" },
  });

  let open = false;
  for (const r of records) {
    if (r.type === "check_in") open = true;
    if (r.type === "check_out") open = false;
  }
  return open;
}
