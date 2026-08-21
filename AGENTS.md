<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Hinthar International School — System Architecture & Role-Based Access Control

## Overview
Hinthar International School (Yangon & Mawlamyine) web platform built on **Next.js (App Router)** and **Cloudflare Workers Native Stack**:
- **Database**: Cloudflare D1 (Relational SQLite) via **Drizzle ORM**
- **Authentication**: **Better Auth** with closed registration & direct invitation provisioning
- **Object Storage**: **Cloudflare R2** (`hinthar-assets`) with metadata tracking in D1 (`file_assets`)
- **Authorization**: Application-Level RBAC with Anti-Lockout Invariant Guards
- **Deployment**: **Cloudflare Workers** via `@opennextjs/cloudflare`

## Role-Based Access Control (RBAC)
No open public registration is permitted. Accounts are directly provisioned:

1. **School Administrator (`admin`)**:
   - Master account: **TYZ** (`thawyezaw@gmail.com`).
   - Authority: Full superadmin access across all modules, single-use invitation provisioning for staff & student accounts, master campus network controls, and admissions approvals.
   - Anti-Lockout: Invariant guard prevents deleting or deactivating the sole remaining active administrator.
2. **Student Contributor (`student`)**:
   - Authorized student leaders and club representatives (e.g. `linmyat.thu@student.hinthar.education`).
   - Authority: Submit and edit their own Alumni Yearbook entries (into a Pending Review queue for Admin approval), submit new Club / Society proposals (into a Pending Review queue for Admin approval), submit Activity proposals tied to their Clubs, and view/edit Class Timetables.
   - Restrictions: Strictly no access to admissions records, user management, or direct unmoderated publishing.

## Core Modules & URLs
- `/` — Main School Landing Page (Pearson Edexcel continuum, 4 campuses highlights, leadership, FAQs)
- `/campuses` — Dedicated showcase for **4 Campuses** (**3 in Yangon: Ywarma, Shwe Padauk, Shwe Pone Nyet** & **1 in Mawlamyine**)
- `/yearbook` — Alumni Yearbook Gallery (Class of 2026, 2025, 2024, distinctions, university destinations)
- `/clubs` — Extracurricular societies (Robotics & AI, Debate/MUN, Science, Arts & Media, Sports)
- `/activities` — School events calendar, innovation fairs, examination series, and graduation ceremonies
- `/classes` — Timetables and syllabi for Lower Secondary (Year 7–9), Pearson IGCSE, and Pearson IAL
- `/admission` — 4-Step interactive online enrollment wizard (Direct Cloudflare D1 `admissions` table sync + Resend email confirmation)
- `/admin` & `/admin/login` — Administrative Portal with Better Auth (Password Login at `/admin/login`; Single-Use Invitations in `/admin/users`), Campuses CRUD, Admissions Pipeline, Yearbook Review Queue, Clubs & Activities management.

## Cloudflare D1 & Drizzle Data Layer
- **D1 Database Binding**: `DB` (Database: `hinthar-db`)
- **R2 Storage Binding**: `R2` (Bucket: `hinthar-assets`)
- **Drizzle Schema**: [`lib/db/schema.ts`](lib/db/schema.ts)
  - `user`, `session`, `account`, `verification`, `invitation`
  - `campuses`, `classes_courses`, `bulletin_notices`, `admissions`, `clubs`, `activities`, `yearbook_alumni`, `file_assets`, `audit_logs`
- **Clients & Server Actions**:
  - [`lib/db/index.ts`](lib/db/index.ts) — Drizzle D1 client singleton.
  - [`lib/auth/auth.ts`](lib/auth/auth.ts) — Better Auth instance.
  - [`lib/auth/rbac.ts`](lib/auth/rbac.ts) — RBAC assertions and audit logging.
  - [`lib/actions/*`](lib/actions/) — Typed Server Actions with Zod validation.
- **Middleware**: [`middleware.ts`](middleware.ts) — Session check and route guard for `/admin/*` and `/api/admin/*`.
