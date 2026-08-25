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

## 3. Database migrations (apply BEFORE first deploy of a new migration)

```bash
npm run db:migrate:prod     # applies drizzle/*.sql to remote D1
npm run d1:seed:prod        # optional: seed campuses/courses/clubs/etc.
```

Migration history:

| File                          | Contents                                        |
| ----------------------------- | ----------------------------------------------- |
| `0000_initial_schema.sql`     | Core tables (auth, campuses, courses, …)        |
| `0001_fuzzy_black_bird.sql`   | Schema additions                                |
| `0002_sparkling_harry_osborn.sql` | Schema additions                            |
| `0003_magenta_spiral.sql`     | **`site_content` table (admin-editable homepage content)** |

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
| Yearbook entries                      | Admin → Yearbook & Honors           |
| Admissions pipeline                   | Admin → Admissions Review           |
| User accounts & invitations           | Admin → User Accounts               |
