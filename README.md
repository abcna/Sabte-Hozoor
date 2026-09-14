# Safadaroo Attendance (MVP)

سیستم حضور و غیاب داروخانه با GPS و سلفی. UI فارسی RTL. دیپلوی روی Vercel.

جزئیات محصول: `PROJECT.md` / `PROJECT.en.md`

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS (دارک + گلس)
- Prisma + PostgreSQL (Prisma Postgres روی Vercel)
- JWT session (`jose` + `bcryptjs`)

## راه‌اندازی لوکال

```bash
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

ادمین پیش‌فرض: `admin` / مقدار `ADMIN_BOOTSTRAP_PASSWORD` (پیش‌فرض `admin123`)

## دیپلوی روی Vercel + Prisma Postgres

### ۱) اتصال دیتابیس

1. در پروژه Vercel برو به **Storage**
2. دیتابیس **Prisma Postgres** (مثلاً `sabte-hozoor`) را **Connect** کن
3. Vercel خودش `DATABASE_URL` را برای Production / Preview ست می‌کند

مستندات: [Prisma Postgres on Vercel](https://www.prisma.io/docs/guides/postgres/vercel)

### ۲) Environment Variables دستی

در **Settings → Environment Variables** این‌ها را اضافه کن (Production + Preview):

| Variable | مثال |
|----------|------|
| `AUTH_SECRET` | یک رشته تصادفی بلند |
| `ADMIN_BOOTSTRAP_PASSWORD` | رمز ادمین اولیه |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-APP.vercel.app` |

`DATABASE_URL` را Prisma Postgres ست می‌کند — دوباره دستی لازم نیست مگر بخواهی override کنی.

### ۳) بیلد

اسکریپت بیلد فقط `prisma generate` + `next build` می‌زند (db push داخل بیلد Vercel نیست تا دیپلوی fail نشود).

بعد از دیپلوی موفق، **یک‌بار** اسکما را روی دیتابیس پروداکشن بساز:

1. در Vercel → Storage → Prisma Postgres → **`.env` / connection string** را کپی کن (`DATABASE_URL`)
2. موقتاً در `.env` لوکال بگذار
3. اجرا کن:

```bash
npm run db:push
npm run db:seed
```

بعد لاگین با `admin` / `ADMIN_BOOTSTRAP_PASSWORD`.

### ۴) Redeploy

بعد از ست کردن envها، یک **Redeploy** بزن.

## جریان کار

1. ادمین: لوکیشن + شیفت + کاربر
2. کارمند: ورود → سلفی زنده + GPS → ثبت ورود / خروج
3. خارج از شعاع: «باید حتماً در داروخانه حاضر باشید.»

GPS و دوربین روی HTTPS کار می‌کنند (Vercel پیش‌فرض HTTPS است).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | لوکال |
| `npm run build` | generate + db push + next build |
| `npm run db:push` | همگام‌سازی اسکما |
| `npm run db:seed` | ساخت ادمین |
| `npm run db:studio` | Prisma Studio |
