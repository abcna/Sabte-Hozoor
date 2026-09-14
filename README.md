# Safadaroo Attendance (MVP)

Pharmacy staff check-in / check-out with GPS geofencing. Dark glass UI. Deploy on Vercel.

See `PROJECT.en.md` / `PROJECT.md` for full product & architecture notes.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS (dark + glassmorphism)
- Prisma + PostgreSQL
- JWT session cookie (`jose` + `bcryptjs`)

## Setup

1. Copy env file:

```bash
cp .env.example .env
```

2. Set `DATABASE_URL` (Neon / Vercel Postgres recommended), `AUTH_SECRET`, and optional `ADMIN_BOOTSTRAP_PASSWORD`.

   Local Postgres via Docker (if installed):

```bash
docker compose up -d
```

   Default local URL is already in `.env.example` style:
   `postgresql://timesheet:timesheet@localhost:5432/timesheet`

3. Install & prepare DB:

```bash
npm install
npx prisma db push
npm run db:seed
```

4. Run locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Default admin (after seed):

- username: `admin`
- password: value of `ADMIN_BOOTSTRAP_PASSWORD` (default `admin123`)

**Change the admin password after first login.**

## Deploy on Vercel

1. Push repo and import into Vercel.
2. Add env vars: `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_BOOTSTRAP_PASSWORD`, `NEXT_PUBLIC_APP_URL`.
3. Build uses `prisma generate` via `postinstall`.
4. Run `prisma db push` (or migrate) against production DB once, then `npm run db:seed`.

Geolocation requires HTTPS (Vercel provides this).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run db:push` | Push Prisma schema |
| `npm run db:seed` | Seed admin user |
| `npm run db:studio` | Prisma Studio |

## Flow

1. Admin creates **Locations** (lat/lng + radius) and **Shifts**.
2. Admin creates **Users** and assigns location + shift.
3. Employee signs in → **Check In** / **Check Out**.
4. Server validates distance with Haversine; outside radius returns: *You must be present at the pharmacy.*
