import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jsonError, requireAdmin } from "@/lib/auth";
import { locationSchema } from "@/lib/validations";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return jsonError("دسترسی غیرمجاز.", 401);

  const locations = await prisma.location.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ ok: true, locations });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("دسترسی غیرمجاز.", 401);

  try {
    const body = await req.json();
    const parsed = locationSchema.safeParse(body);
    if (!parsed.success) return jsonError("اطلاعات لوکیشن نامعتبر است.");

    const location = await prisma.location.create({ data: parsed.data });
    return NextResponse.json({ ok: true, location }, { status: 201 });
  } catch (error) {
    console.error("create location", error);
    return jsonError("ایجاد لوکیشن ناموفق بود.", 500);
  }
}
