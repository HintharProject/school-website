<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Hinthar International School — System Architecture & Role-Based Access Control

## Overview
Hinthar International School (Yangon & Mawlamyine) web platform built on **Next.js (App Router)** and **Supabase PostgreSQL Backend** (`@supabase/supabase-js`, `@supabase/ssr`). Ready for deployment on **Cloudflare Pages**.

## 3-Tier Role-Based Access Control (RBAC)
No open public registration is permitted. Accounts are directly provisioned:

1. **School Principal (`principal`)**:
   - Master account: **Dr. Kaung Myat Htut** (`kaungmyat.htut@gmail.com` / `Kmh132546$`).
   - Authority: Full superadmin access across all modules, direct provisioning of Staff Admin & Student Contributor accounts, master campus network controls, and admissions approvals.
2. **Faculty & Staff Administrator (`staff_admin`)**:
   - Authorized admissions officers, coordinators, and faculty leads (e.g. `admissions.head@hinthar.education`, `minzaw.stem@hinthar.education`).
   - Authority: Admissions pipeline management, booking assessments, class timetables, reviewing student yearbook submissions, and provisioning Student Contributor accounts.
3. **Student Contributor (`student`)**:
   - Student representatives, class editors, and society leads (e.g. `linmyat.thu@student.hinthar.education`, `sumyat.noe@student.hinthar.education`).
   - Authority: Data entry for **Alumni Yearbook** and **Student Clubs**. Student submissions enter a **Pending Review Queue** for faculty approval prior to public publishing. Restricted from admissions and root configurations.

## Core Modules & URLs
- `/` — Main School Landing Page (Pearson Edexcel continuum, 4 campuses highlights, leadership, FAQs)
- `/campuses` — Dedicated showcase for **4 Campuses** (**3 in Yangon: Ywarma, Shwe Padauk, Shwe Pone Nyet** & **1 in Mawlamyine**)
- `/yearbook` — Alumni Yearbook Gallery (Class of 2026, 2025, 2024, distinctions, university destinations)
- `/clubs` — Extracurricular societies (Robotics & AI, Debate/MUN, Science, Arts & Media, Sports)
- `/classes` — Timetables and syllabi for Lower Secondary (Year 7–9), Pearson IGCSE, and Pearson IAL
- `/admission` — 4-Step interactive online enrollment wizard (Direct Supabase `admissions` table sync)
- `/chatbot` & `ChatbotWidget` — AI Consultation Chatbot powered by `/api/chatbot`
- `/admin` & `/admin/login` — Faculty & Staff Portal with Supabase Auth (Password Login at `/admin/login`; Magic Invite Link generation & direct provisioning in `/admin/users`), Campuses CRUD, Admissions Pipeline, Yearbook Review Queue, Clubs management.

## Supabase Backend & Database Setup
- **Project Ref**: `ytmylxemqrsjxdvrthxx` (`https://ytmylxemqrsjxdvrthxx.supabase.co`)
- **Schema Migration**: [`supabase/schema.sql`](supabase/schema.sql)
  - `user_profiles` (id, email, full_name, role, title, campus_id, grade, status)
  - `campuses` (id, name, city, tagline, address, phone, email, office_hours, grades_served, facilities, image_url, is_active)
  - `yearbook_alumni` (id, name, category, role, destination, subjects, quote, image, badge, status, submitted_by)
  - `clubs` (id, name, category, icon, members, meeting_time, leadership, description, image, status, submitted_by, is_active)
  - `admissions` (id, student_name, date_of_birth, gender, nationality, grade, academic_stream, selected_subjects, parent_email, parent_phone, status, notes)
  - `classes_courses` & `bulletin_notices`
- **Clients**:
  - [`lib/supabase/client.ts`](lib/supabase/client.ts) — Browser client singleton (`createBrowserClient`).
  - [`lib/supabase/server.ts`](lib/supabase/server.ts) — SSR / Server Component client (`createServerClient`).
  - [`lib/supabase/admin.ts`](lib/supabase/admin.ts) — Service Role client for elevated backend API routes only.
- **Middleware**: [`middleware.ts`](middleware.ts) — Session refresh and route guard for `/admin/*`.

## Performance & Optimization Rules
1. Always use selective field projection (`.select('id, name, city, ...')`) instead of pulling full unnecessary payloads.
2. Next.js `<Image>` with explicit dimensions or `fill` with `sizes` for optimal image CDN compression.
3. Safe fallback logic in client components so the UI functions seamlessly with Supabase or offline local store.
