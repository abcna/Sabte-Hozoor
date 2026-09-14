# Pharmacy Attendance System — MVP

Reference document for development. Goal: a simple, efficient web app deployable on Vercel that records staff check-in / check-out based on geolocation.

---

## 1. Product Summary

A web application for pharmacy staff attendance.

- Users sign in with username and password.
- They tap **Check In** / **Check Out**.
- The browser captures the current GPS position.
- The server verifies whether the user is inside the allowed radius of their assigned location.
- If yes → the timestamp is saved.
- If no → show: **"You must be present at the pharmacy."**

Admins manage users, locations, and shifts in a separate panel, and assign a location and shift to each user.

---

## 2. MVP Scope (In / Out)

### In

- Simple login (username + password)
- Admin panel: CRUD for users, locations, shifts
- Assign location and shift per user
- Check-in / check-out with GPS validation
- Simple attendance records list (admin)
- Deploy on Vercel
- **Modern dark + glassmorphism UI** (professional, polished)

### Out (later phases)

- Native mobile apps
- Advanced GPS spoofing / anti-fraud
- Payroll / overtime reporting
- Notifications, leave requests, correction workflows
- Complex multi-role systems (only `admin` and `employee`)
- Multiple concurrent shifts per person

---

## 3. Recommended Stack (simple + Vercel-friendly)

One repo, one app — minimal deploy friction.

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | **Next.js (App Router) + React + TypeScript** | React + API in one project; native Vercel deploy |
| UI | **Tailwind CSS + custom glass components** | Fast, consistent dark/glass design system |
| Motion | CSS transitions / Framer Motion (light use) | Subtle polish without bloat |
| Icons | Lucide React | Clean, modern icon set |
| Database | **PostgreSQL** (Neon or Vercel Postgres) | Cheap/free and Vercel-compatible |
| ORM | **Prisma** | Simple models + migrations |
| Auth | HTTP-only session cookie (Auth.js or lightweight custom JWT) | No heavy auth SaaS required |
| Passwords | bcrypt | Standard and enough for MVP |
| Maps (admin) | Leaflet + OpenStreetMap, or manual lat/lng | No paid map API required |
| Hosting | **Vercel** | As required |

> A split React + separate backend is possible later; for MVP, Next.js is enough.

---

## 4. Design System — Dark + Glass (required)

The UI must feel **attractive, modern, and professional** — not a generic admin template.

### 4.1 Visual direction

- **Theme:** Dark mode by default (primary product look)
- **Style:** Glassmorphism — frosted panels over atmospheric backgrounds
- **Tone:** Calm, clinical-professional (pharmacy context), premium SaaS feel
- **Avoid:** Flat gray dashboards, default Inter-only layouts, purple-neon clichés, noisy glow spam

### 4.2 Color tokens (suggested CSS variables)

```css
:root {
  /* Atmosphere */
  --bg-base: #070b14;
  --bg-elevated: #0d1424;
  --bg-glow-1: rgba(56, 189, 248, 0.18);   /* soft cyan */
  --bg-glow-2: rgba(45, 212, 191, 0.12);   /* soft teal */

  /* Glass surfaces */
  --glass-bg: rgba(255, 255, 255, 0.06);
  --glass-bg-strong: rgba(255, 255, 255, 0.10);
  --glass-border: rgba(255, 255, 255, 0.12);
  --glass-blur: 18px;

  /* Text */
  --text-primary: #f4f7fb;
  --text-secondary: rgba(244, 247, 251, 0.68);
  --text-muted: rgba(244, 247, 251, 0.42);

  /* Accents */
  --accent: #2dd4bf;          /* teal — primary actions */
  --accent-strong: #14b8a6;
  --danger: #fb7185;
  --success: #34d399;
  --warning: #fbbf24;
}
```

### 4.3 Glass surface recipe

Use consistently for cards, forms, sidebars, modals:

```css
.glass {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}
```

Background layer (app shell):

- Deep navy/charcoal base
- Soft radial gradients (cyan/teal) behind the main content — **atmosphere, not decoration overload**
- Optional subtle noise/grain at very low opacity for depth

### 4.4 Typography

- Display / headings: a distinctive modern sans (e.g. **Geist**, **Satoshi**, or **Plus Jakarta Sans**) — not a plain system stack alone
- Body: same family at regular weight, excellent contrast on dark glass
- Clear hierarchy: one strong title per screen, supporting meta in secondary text color

### 4.5 Components (visual rules)

| Component | Guidance |
|-----------|----------|
| Buttons (primary) | Solid teal accent, soft hover lift, clear focus ring |
| Buttons (secondary) | Glass outline / translucent |
| Inputs | Dark translucent fields, light border, focus = accent glow (subtle) |
| Cards / panels | Glass only — no heavy multi-shadow stacks |
| Tables (admin) | Glass container, zebra rows at low contrast, sticky header optional |
| Status chips | Soft tinted pills (success / warning / danger) — restrained radius |
| Login | Centered glass card on atmospheric dark background |
| Attendance CTA | Large, thumb-friendly primary button; status ring/indicator above it |
| Toasts / errors | Glass toast; out-of-range uses danger accent + clear copy |

### 4.6 Motion

Ship **2–3 intentional motions**, not noise:

1. Soft fade/slide-in for page or glass panels
2. Button press / loading pulse on check-in/out
3. Status change transition (e.g. Not checked in → On site)

Prefer CSS; add Framer Motion only where it clearly helps.

### 4.7 Responsive

- Attendance app is **mobile-first** (staff use phones on site)
- Admin panel is **desktop-first**, usable on tablet
- Touch targets ≥ 44px on consumer screens

### 4.8 Accessibility

- Contrast WCAG AA on text vs glass surfaces
- Visible focus states
- Do not rely on color alone for status
- Respect `prefers-reduced-motion`

### 4.9 Screen mood references (implementation intent)

- **Login:** full-bleed dark atmosphere + single centered glass auth card
- **Attendance:** one focused composition — identity, status, one big action
- **Admin:** dark glass sidebar + content panels; dense but calm data UI

---

## 5. Roles & Pages

### 5.1 Roles

| Role | Access |
|------|--------|
| `admin` | Full admin panel |
| `employee` | Own attendance app only |

### 5.2 Employee app

1. `/login` — sign in
2. `/` or `/attendance` — main screen:
   - User name, location, shift
   - Today’s status: `Not checked in` / `On site` / `Checked out`
   - **Check In** or **Check Out** button
   - Error message when outside geofence

### 5.3 Admin panel

1. `/admin` — light dashboard (optional in MVP: nav links only)
2. `/admin/users` — user list + create/edit/delete
3. `/admin/locations` — location list + create/edit/delete
4. `/admin/shifts` — shift list + create/edit/delete
5. `/admin/attendance` — check-in/out records (filters: date, user)

---

## 6. Data Model

### 6.1 User

| Field | Type | Notes |
|-------|------|--------|
| id | string/cuid | Primary key |
| name | string | Display name |
| username | string | Unique — login |
| passwordHash | string | Hashed password |
| phone | string | Phone number |
| role | enum | `admin` \| `employee` |
| locationId | string? | Assigned location |
| shiftId | string? | Assigned shift |
| isActive | boolean | Active flag |
| createdAt | datetime | |
| updatedAt | datetime | |

### 6.2 Location

| Field | Type | Notes |
|-------|------|--------|
| id | string | |
| name | string | e.g. "Central Pharmacy" |
| latitude | float | |
| longitude | float | |
| radiusMeters | int | Default suggestion: **150** |
| address | string? | Optional |
| createdAt | datetime | |

### 6.3 Shift

| Field | Type | Notes |
|-------|------|--------|
| id | string | |
| name | string | e.g. "Morning" / "Evening" |
| startTime | string | `HH:mm` e.g. `08:00` |
| endTime | string | `HH:mm` e.g. `16:00` |
| createdAt | datetime | |

> In MVP, shifts are organizational/display. Hard “only allow punch inside shift hours” is optional; recommended: store + show only, no time lock.

### 6.4 AttendanceRecord

| Field | Type | Notes |
|-------|------|--------|
| id | string | |
| userId | string | |
| locationId | string | Location at punch time |
| type | enum | `check_in` \| `check_out` |
| recordedAt | datetime | **Server time** |
| clientLatitude | float | Client-sent coords |
| clientLongitude | float | |
| distanceMeters | float | Computed distance to location center |
| createdAt | datetime | |

---

## 7. Business Logic

### 7.1 Check-in (`check_in`)

1. User must be authenticated (`employee`; admin optional for testing).
2. User must have `locationId`; else: `"No location is assigned to you."`
3. Client reads GPS via `navigator.geolocation`.
4. If permission denied → `"Location access is required."`
5. Server computes Haversine distance to location center.
6. If `distance > radiusMeters` → reject with: **"You must be present at the pharmacy."**
7. If inside radius:
   - If an open `check_in` exists without `check_out` → `"Already checked in."`
   - Else save `check_in`.

### 7.2 Check-out (`check_out`)

Same location + GPS rules.

Extra rule:

- An open `check_in` must exist; else: `"Check in first."`

### 7.3 Haversine formula

```
R = 6371000  // Earth radius in meters
Δφ = (lat2 - lat1) in radians
Δλ = (lng2 - lng1) in radians
a = sin²(Δφ/2) + cos(φ1)·cos(φ2)·sin²(Δλ/2)
c = 2·atan2(√a, √(1−a))
distance = R·c
```

Allowed when `distance <= location.radiusMeters`.

### 7.4 GPS accuracy notes

- Indoor GPS is weak → use a realistic radius (100–200 m).
- Tell users to wait a few seconds for a better fix.
- Advanced anti-spoof is out of MVP scope.

---

## 8. Suggested API

All under Next.js Route Handlers: `/api/...`

### Auth

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/auth/login` | `{ username, password }` → session/cookie |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Current user + location + shift |

### Admin — Users

| Method | Path |
|--------|------|
| GET | `/api/admin/users` |
| POST | `/api/admin/users` |
| GET | `/api/admin/users/:id` |
| PUT | `/api/admin/users/:id` |
| DELETE | `/api/admin/users/:id` |

Example body:

```json
{
  "name": "Ali Rezaei",
  "username": "ali",
  "password": "secret123",
  "phone": "09121234567",
  "role": "employee",
  "locationId": "...",
  "shiftId": "...",
  "isActive": true
}
```

### Admin — Locations

| Method | Path |
|--------|------|
| GET/POST | `/api/admin/locations` |
| PUT/DELETE | `/api/admin/locations/:id` |

```json
{
  "name": "Central Pharmacy",
  "latitude": 35.6892,
  "longitude": 51.3890,
  "radiusMeters": 150,
  "address": "Tehran..."
}
```

### Admin — Shifts

| Method | Path |
|--------|------|
| GET/POST | `/api/admin/shifts` |
| PUT/DELETE | `/api/admin/shifts/:id` |

```json
{
  "name": "Morning Shift",
  "startTime": "08:00",
  "endTime": "16:00"
}
```

### Attendance

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/attendance/check-in` | `{ latitude, longitude }` |
| POST | `/api/attendance/check-out` | `{ latitude, longitude }` |
| GET | `/api/attendance/today` | Current user’s today status |
| GET | `/api/admin/attendance` | Admin list (`?from=&to=&userId=`) |

Out-of-range error example:

```json
{
  "ok": false,
  "code": "OUT_OF_RANGE",
  "message": "You must be present at the pharmacy.",
  "distanceMeters": 420,
  "allowedRadiusMeters": 150
}
```

> Product copy may also be shown in Persian in the UI for local staff; keep API `message` consistent with the active locale later if i18n is added.

---

## 9. Employee UI Flow

```
[Login]
   ↓
[Attendance]
   ├── Show: name, location, shift, today’s status
   ├── On out-of-range attempt → clear danger message
   ├── Check In (if not yet in)
   └── Check Out (if checked in and not yet out)
```

UX requirements:

- Request location permission before punch
- Loading state on the action button until server responds
- Success: brief confirmation + refresh status
- Out of range: fixed product message

---

## 10. Admin UI Flow

### Users

- Form: name, username, password, phone, role, location, shift, active
- On edit: location & shift via dropdowns

### Locations

- Name + lat + lng + radius
- MVP: numeric lat/lng + **Use my current location** for admin
- Optional: Leaflet map click-to-set

### Shifts

- Name + start/end time

### Attendance

- Table: user, type, time, location, distance
- Filters: date range, user

Admin UI must follow the same dark glass system (sidebar + glass content panels).

---

## 11. Initial Seed

After first migrate, create a bootstrap admin:

```
username: admin
password: (from env, e.g. ADMIN_BOOTSTRAP_PASSWORD)
role: admin
```

Document in README that the password must be changed after first login.

---

## 12. Environment Variables

```env
DATABASE_URL=
AUTH_SECRET=
ADMIN_BOOTSTRAP_PASSWORD=
NEXT_PUBLIC_APP_URL=
```

---

## 13. Suggested Folder Structure

```
timesheet/
├── PROJECT.md                 ← Persian reference
├── PROJECT.en.md              ← This document
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (app)/attendance/page.tsx
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   ├── locations/
│   │   │   ├── shifts/
│   │   │   └── attendance/
│   │   └── api/
│   │       ├── auth/
│   │       ├── admin/
│   │       └── attendance/
│   ├── components/
│   │   ├── ui/                ← glass Button, Input, Card, etc.
│   │   └── layout/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── geo.ts             ← Haversine
│   │   ├── theme.css          ← design tokens
│   │   └── validations.ts
│   └── types/
├── package.json
└── README.md
```

---

## 14. Development Phases

### Phase 0 — Project skeleton
- Next.js + Tailwind + Prisma
- Design tokens + base glass UI primitives
- DB connect, models, migrate
- Admin seed

### Phase 1 — Auth
- Login / logout / `me`
- Protect `/admin/*` and `/attendance`

### Phase 2 — Admin CRUD
- Locations
- Shifts
- Users (+ location/shift assignment)
- Dark glass admin chrome

### Phase 3 — Attendance
- Client GPS capture
- Check-in / check-out APIs
- Distance logic + out-of-range message
- Today status UI (mobile-first glass screen)

### Phase 4 — Admin attendance list
- Table + simple filters

### Phase 5 — Vercel deploy
- Neon/Postgres
- Env vars
- Real device test at the pharmacy

---

## 15. MVP Acceptance Criteria

- [ ] Admin can create a location with coordinates and radius
- [ ] Admin can create a shift
- [ ] Admin can create a user and assign location/shift
- [ ] Employee logs in and only sees the attendance app
- [ ] Check-in inside radius succeeds and stores server time
- [ ] Check-in outside radius fails with the pharmacy-present message
- [ ] Check-out follows the same geofence rules
- [ ] Admin can view attendance records
- [ ] App runs on Vercel and works on mobile
- [ ] UI matches dark + glassmorphism design system (login, attendance, admin)

---

## 16. Architecture Decisions (summary)

1. **Single Next.js app** instead of separate React + API → simpler on Vercel.
2. **Geofence validation only on the server** — client sends coords; server decides.
3. **Per-location radius** — admin-configurable.
4. **Punch time = server time** — client never chooses the clock.
5. **No hard shift-hour lock in MVP** — shifts are for display/reporting later.
6. **Dark glass UI is part of MVP**, not a polish phase.

---

## 17. Risks & MVP Mitigations

| Risk | Simple mitigation |
|------|-------------------|
| Weak indoor GPS | Radius 150–200 m |
| User denies location | Block punch + clear message |
| Fake GPS apps | Ignore in MVP; later log accuracy/speed/IP |
| Device clock skew | Always use server `recordedAt` |
| Geolocation needs HTTPS | Vercel provides HTTPS by default |
| Glass blur performance on low-end phones | Cap blur, reduce layered filters on mobile |

---

## 18. How to Start Building

1. Scaffold Next.js from this document.
2. Implement Prisma schema from section 6.
3. Add design tokens + glass primitives early (Phase 0).
4. Follow phases in section 14 in order.
5. After Phase 3, test on a real phone inside the pharmacy radius.

This file is the English product + architecture contract for the MVP. Update it first when scope changes.

**Companion:** `PROJECT.md` (Persian).
