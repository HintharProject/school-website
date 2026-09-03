# Hinthar International School Web Platform

Official website and administration system for Hinthar International School in Yangon and Mawlamyine.

## Stack

- Next.js App Router, React, TypeScript, Tailwind CSS
- Cloudflare Workers via `@opennextjs/cloudflare`
- Cloudflare D1 with Drizzle ORM
- Cloudflare R2 for campus, club, Yearbook, and admission files
- Better Auth with closed registration and role-based access
- Resend admission email notifications

## Main features

- Public school, campus, classes, clubs, activities, news, staff, and Yearbook pages
- Four-step admission form for Lower Secondary (Years 7–9), Pearson IGCSE, and Pearson IAL
- Real admission document uploads: identity document, latest school report, and student photo
- Shareable application tracking links: `/portal?id=HIS-...&email=...`
- Region-specific Yearbook batches for Yangon and Mawlamyine
- Campus and club image galleries
- Administrator-managed admission subjects, academic streams, and starting terms

## Access model

- `admin`: full administration, admissions decisions, account invitations, configuration, and publishing
- `student`: may submit and edit their own Yearbook and club content for administrator review
- Public self-registration is disabled

## Local development

```bash
npm install
npm run dev
```

`npm run dev` automatically applies pending local D1 migrations before Next.js starts. Local Cloudflare binding data is persisted under `%LOCALAPPDATA%\hinthar-dev\wrangler-state` on Windows.

Useful commands:

```bash
npm run db:migrate:local
npm run d1:seed:local
npm run lint
npx tsc --noEmit
npm run build
npm run build:cloudflare
```

## Routes

- `/` — school landing page
- `/campuses`, `/classes`, `/clubs`, `/activities`, `/news`, `/staff`
- `/yearbook` — public regional Yearbook
- `/admission` — online application
- `/portal` — public application status lookup
- `/admin/login`, `/admin` — authenticated administration

## Deployment

See [DEPLOY.md](DEPLOY.md). Always apply remote D1 migrations before deploying application code that depends on a new schema:

```bash
npm run db:migrate:prod
npm run deploy
```
