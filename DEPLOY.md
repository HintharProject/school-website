# Hinthar International School — Deployment Runbook

Stack: Next.js (App Router) → `@opennextjs/cloudflare` → Cloudflare Workers,
D1 (`hinthar-db`) via Drizzle ORM, R2 (`hinthar-assets`) for uploads,
Better Auth for the admin portal.

## 1. Prerequisites

- Node.js 24+, npm
- `npx wrangler login` (Cloudflare account with the D1 + R2 resources below)

| Resource   | Binding | Name                     |
| ---------- | ------- | ------------------------ |
| D1         | `DB`    | `hinthar-db`             |
| R2         | `R2`    | `hinthar-assets`         |

## 2. Environment & secrets

Local development uses `.env.local` (Next.js) and `.dev.vars` (Wrangler).
Copy from `.env.example`. In production set secrets:

```bash
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put ADMIN_BOOTSTRAP_SECRET
npx wrangler secret put INITIAL_ADMIN_EMAIL
npx wrangler secret put INITIAL_ADMIN_PASSWORD
npx wrangler secret put INITIAL_ADMIN_NAME
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_FROM
```

> Local-dev note: Cloudflare bindings are persisted in
> `%LOCALAPPDATA%\hinthar-dev\wrangler-state` (configured in `next.config.ts`)
> because antivirus ransomware shields block `workerd.exe` writes under the
> Desktop folder (SQLITE_READONLY).

## 3. Database migrations

Local migrations run automatically through `predev`. They can also be applied explicitly:

```bash
npm run db:migrate:local
npm run dev
```

The local migration script uses the same `%LOCALAPPDATA%\hinthar-dev\wrangler-state`
directory as `next.config.ts`, avoiding schema drift between Wrangler and Next.js.

Apply remote migrations **before** the first production deploy that uses them:

```bash
npm run db:migrate:prod
npm run d1:seed:prod        # optional
npm run deploy
```

Migration history:

| File                          | Contents                                        |
| ----------------------------- | ----------------------------------------------- |
| `0000_initial_schema.sql`     | Core tables (auth, campuses, courses, …)        |
| `0001_fuzzy_black_bird.sql`   | Schema additions                                |
| `0002_sparkling_harry_osborn.sql` | Schema additions                            |
| `0003_magenta_spiral.sql`     | **`site_content` table (admin-editable homepage content)** |
| `0004_community_modules.sql`  | Community content modules                         |
| `0005_bilingual_public_content.sql` | Bilingual public content fields            |
| `0006_add_campuses_map_url.sql` | Campus map links                              |
| `0007_drop_campus_office_hours_facilities.sql` | Campus schema cleanup              |
| `0008_admission_and_galleries.sql` | Admission documents, upload limits, campus/club galleries |
| `0009_yearbook_batches.sql`   | Regional Yearbook batches and legacy data backfill |

## 4. Build & deploy

```bash
npm run deploy              # opennextjs-cloudflare build + deploy
```

## 5. First-time administrator bootstrap

After the first deploy (or whenever the remote DB is recreated):

```bash
curl -X POST https://hinthar.thawyezaw.workers.dev/api/admin/bootstrap \
  -H "x-admin-bootstrap-secret: <ADMIN_BOOTSTRAP_SECRET>"
```

Then log in at `/admin/login` with the `INITIAL_ADMIN_*` credentials.

## 6. Editing live website content

All public data is managed from the Admin Portal:

| Public surface                        | Admin page                          |
| ------------------------------------- | ----------------------------------- |
| Hero stats / announcements / FAQs / programs showcase / footer contact | **Admin → Site Content** (`/admin/content`) |
| Campus cards & maps                   | Admin → Campuses                    |
| Class timetables & bulletin notices   | Admin → Classes & Syllabi           |
| Clubs & activities                    | Admin → Clubs & Activities          |
| Regional Yearbook batches and entries | Admin → Yearbook                    |
| Admissions pipeline, subjects, and starting terms | Admin → Admissions Review |
| User accounts & invitations           | Admin → User Accounts               |
