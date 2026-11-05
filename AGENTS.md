<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Hinthar International School — Engineering & Architecture Guide (`AGENTS.md`)

> **MANDATORY LIVING DOCUMENTATION RULE (NON-NEGOTIABLE)**:
> Whenever you add, modify, or remove any route, component section, database table/column, Server Action, RBAC permission, bilingual translation rule, or visual token, **you MUST update both [`AGENTS.md`](AGENTS.md) and [`spec.md`](spec.md) (including the Change Log in `spec.md`) in the exact same task before finishing.**

## 1. Platform Overview
**Hinthar International School** (Yangon & Mawlamyine) web platform built on **Next.js 16 (App Router)** and the **Cloudflare Workers Native Stack**:
- **Database**: Cloudflare D1 (SQLite) via **Drizzle ORM** ([`lib/db/schema.ts`](lib/db/schema.ts))
- **Authentication**: **Better Auth** with closed registration & single-use invitation provisioning ([`lib/auth/auth.ts`](lib/auth/auth.ts))
- **Object Storage**: **Cloudflare R2** (`hinthar-assets`) with metadata tracked in `file_assets`
- **Authorization**: Application-level RBAC with Sole-Admin Anti-Lockout Invariant ([`lib/auth/rbac.ts`](lib/auth/rbac.ts))
- **Deployment**: **Cloudflare Workers** via `@opennextjs/cloudflare`
- **Master Specification**: See [`spec.md`](spec.md) and [`design-system/hinthar-international-school/MASTER.md`](design-system/hinthar-international-school/MASTER.md)

## 2. Strictly 5 Public Pages & Navigation Rules
To minimize technical maintenance and deliver an impressive, clutter-free visitor experience, the public website consists of **strictly 5 pages** (no top-bar dropdown menus; `Classes` lives on the Home page at `/#classes` and is **not** a separate navbar link):

1. `/` — **Home Page**: Top Announcement Ticker, Split/Framed Hero + 4 Key Highlight Stats, About Hinthar & Principal Welcome, **`#classes` Pearson Edexcel Pathways & Syllabus Modal**, Campuses Overview Strip, Parent/Alumni Testimonials, and FAQs.
2. `/campuses` — **Campuses**: Dynamic Admin-managed campuses (seeded with **4 in Yangon: Shwe Hinthar, Ywarma, Shwe Padauk, Shwe Pone Nyet** & **1 in Mawlamyine (IS Licensed)**), city filter tabs, Gallery Lightbox, facilities, grades served, contacts, and Google Maps links.
3. `/yearbook` — **Student Yearbook**: Strictly for students/alumni (no staff directory), filterable by Region (`Yangon` / `Mawlamyine`) and Batch (`Class of 2026`, `2025`, etc.).
4. `/clubs` — **Clubs & Activities**: Combined student life portal with top segment tabs (`All`, `Clubs & Societies`, `School Activities`), contextual category/status sub-filters, and unified card gallery.
5. `/admission` — **Admissions & Status Tracker**: Segmented view with **Apply Online** (streamlined 3-Step Pearson application + Admin-configurable Required/Optional R2 document uploads + `HIS-YYYY-XXXXXX` receipt) and **Track Application Status** (`?tab=track`).

*Legacy paths (`/classes`, `/portal`, `/activities`, `/staff`, `/news`, `/chatbot`) permanently `308` redirect in [`next.config.ts`](next.config.ts).*

## 3. Brand Design, Factual Accuracy & Bilingual (`EN` / `MY`) Rules
- **Brand Palette (`Hinthar_logo.png`)**: Crisp White (`#FFFFFF`) primary canvas, Soft Slate (`#F8FAFC`) secondary surface, Hinthar Royal Cobalt Blue (`#193E8A` / `#0F2759`), Luminous Hinthar Gold (`#FFD600` CTAs paired strictly with dark `#162033` text for AAA contrast), and Charcoal Ink (`#1E232B`).
- **Fonts & Icons**: Self-hosted `Outfit` + `Inter` + `Noto Sans Myanmar` via `next/font/google` (Myanmar script enforces `line-height: 1.8`). Vector icons use `@phosphor-icons/react` — **never** load external Google Material Symbols icon fonts or use emojis as UI icons.
- **Strictly Pearson Edexcel**: Hinthar offers Pearson Edexcel pathways only (`Lower Secondary Year 7–9`, `Pearson Edexcel IGCSE`, `Pearson Edexcel IAL`). Do not introduce Cambridge, Vocational, or Foundation categories.
- **Non-Translated Proper Nouns**: Keep **`Hinthar International School`**, **`Pearson Edexcel`**, **`IGCSE`**, **`IAL`**, **`STEM`**, and subject codes in English across **both** `EN` and `MY` locales. Missing `MY` fields fall back gracefully to `EN` via `locField()`, while `/admin` flags empty `MY` fields with a `Needs Burmese` badge.

## 4. Role-Based Access Control (RBAC) & Page-Mirrored Admin Portal
No open public registration exists. Accounts are provisioned via single-use invitations:

1. **School Administrator (`admin`)** — Master account: `thawyezaw@gmail.com`
   - **100% Website Editability**: Updates every public text, stat, photo, campus, Pearson pathway/subject, yearbook entry, club, activity, testimonial, FAQ, footer contact, and admission option/upload requirement.
   - **Page-Mirrored Admin Sidebar**:
     - `/admin` — Overview & Unified Pending Review Queue
     - `/admin/home` — Home Page, Brand, Ticker, Hero, Principal, Pearson Classes/Subjects, Testimonials, FAQs & Footer
     - `/admin/campuses` — Campuses Manager
     - `/admin/yearbook` — Student Yearbook & Regional Batches Manager
     - `/admin/clubs` — Clubs, Member Rosters & Activities Manager
     - `/admin/admissions` — Admissions Pipeline, CSV Export & Form/Upload Config
     - `/admin/users` — Users & Single-Use Invitations (guarded by `assertNotLastAdmin()`)
2. **Student Contributor (`student`)**
   - Authorized student leaders (`role === "student"`).
   - **Focused Scope**: Submit/edit own Yearbook entry (`/admin/yearbook`), propose/edit Clubs, and submit Club Activity drafts (`/admin/clubs`) — all routed to `pending_review` for Admin approval.
   - **Strict Restrictions**: Zero access to `/admin/home`, `/admin/campuses`, `/admin/admissions`, `/admin/users`, or direct unmoderated publishing.

## 5. Data, Caching & Route Guard Layer
- **Drizzle Schema**: [`lib/db/schema.ts`](lib/db/schema.ts) (`user`, `session`, `account`, `verification`, `invitation`, `audit_logs`, `site_content`, `campuses`, `academic_programs`, `academic_subjects`, `program_subject_links`, `testimonials`, `yearbook_batches`, `yearbook_alumni`, `clubs`, `club_members`, `activities`, `admissions`, `admission_upload_limits`, `file_assets`).
- **Tagged Cache & Instant Revalidation**: [`lib/cache/publicCache.ts`](lib/cache/publicCache.ts) caches public D1 reads and invalidates tags immediately inside every Admin Server Action mutation.
- **Route Protection**: [`middleware.ts`](middleware.ts) + server-side `requireAdmin()` / `requireStudentOrAdmin()` in [`lib/auth/rbac.ts`](lib/auth/rbac.ts).
