import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("دسترسی غیرمجاز.", 401);

  const { id } = await params;
  const record = await prisma.attendanceRecord.findUnique({
    where: { id },
    select: { photoBase64: true, photoMime: true, type: true },
  });

  if (!record?.photoBase64) {
    return jsonError("عکسی برای این رکورد وجود ندارد.", 404);
  }

  const buffer = Buffer.from(record.photoBase64, "base64");
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": record.photoMime || "image/jpeg",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
