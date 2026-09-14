import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const coordsSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/** Live selfie for check-in: data URL jpeg/webp/png, max ~700KB encoded. */
export const checkInSchema = coordsSchema.extend({
  photoDataUrl: z
    .string()
    .min(100, "عکس سلفی الزامی است.")
    .max(900_000, "حجم عکس زیاد است. دوباره بگیرید.")
    .refine(
      (v) => /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(v),
      "فرمت عکس نامعتبر است.",
    ),
});

export function splitDataUrl(dataUrl: string): { mime: string; base64: string } {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) throw new Error("invalid data url");
  return { mime: match[1], base64: match[2] };
}

export const locationSchema = z.object({
  name: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().int().min(10).max(5000).default(150),
  address: z.string().optional().nullable(),
});

export const shiftSchema = z.object({
  name: z.string().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const userCreateSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(2),
  password: z.string().min(4),
  phone: z.string().min(5),
  role: z.enum(["admin", "employee"]).default("employee"),
  locationId: z.string().nullable().optional(),
  shiftId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  username: z.string().min(2).optional(),
  password: z.string().min(4).optional(),
  phone: z.string().min(5).optional(),
  role: z.enum(["admin", "employee"]).optional(),
  locationId: z.string().nullable().optional(),
  shiftId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});
