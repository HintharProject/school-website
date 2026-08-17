# Hinthar International School — Web Platform & Supabase Backend

Official web platform and administration system for **[Hinthar International School](https://hinthar.education/)** (Yangon & Mawlamyine, Myanmar).

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and a **Supabase PostgreSQL Backend**.

---

## 🌟 Core Features

- 🏛️ **4 School Campuses Showcase (`/campuses`)**:
  - **Ywarma Campus (Yangon)**: Flagship Academic Center & Pearson Examination Hall.
  - **Shwe Padauk Campus (Yangon)**: Senior STEM, AI & Robotics Innovation Center.
  - **Shwe Pone Nyet Campus (Yangon)**: Lower Secondary (Year 7–9) & Creative Arts Hub.
  - **Mawlamyine Campus (Mon State)**: Regional Center of Academic Excellence.
- 🎓 **Alumni Yearbook Gallery (`/yearbook`)**:
  - Cohort filtering (Class of 2026, 2025, 2024, Placements).
  - Search by student, distinction, subjects, and top global university destinations.
- 👥 **Student Clubs & Societies (`/clubs`)**:
  - STEM & Robotics, Model UN & Debate, Newton Science, Digital Arts & Media, Sports.
- 📝 **4-Step Admissions Wizard (`/admission`)**:
  - Online student enrollment and automated Reference ID generation (`HIS-2026-XXXX`).
  - Asynchronous pipeline storage into Supabase `admissions` table.
- 🤖 **AI Consultation Chatbot (`/chatbot` & Floating Widget)**:
  - Smart prompt-based answers to parents & students regarding curriculums, campuses, and admissions via `/api/chatbot`.
- 🔐 **3-Tier Role-Based Admin Portal (`/admin` & `/admin/login`)**:
  - **No Public Self-Registration**: All accounts are directly provisioned by authorized leadership.
  - **School Principal (`principal`)**: Full superadmin authority (Dr. Kaung Myat Htut: `kaungmyat.htut@gmail.com`).
  - **Faculty & Staff (`staff_admin`)**: Admissions processing, timetable scheduling, review queue moderation, and student account creation.
  - **Student Contributors (`student`)**: Scoped data entry for Yearbook and Clubs (submissions route to a **Staff Review Queue** before publishing).

---

## 🔐 User Roles & Permissions Matrix

| Module / Action | Principal (`Dr. Kaung Myat Htut`) | Faculty & Staff Admin | Student Contributor |
|---|---|---|---|
| **User Account Creation** | ✅ Staff Admin & Students | ✅ Students only | ❌ Disabled |
| **Campuses Master Config** | ✅ Full CRUD (4 Campuses) | ✅ Full CRUD | ❌ Restricted |
| **Admissions Pipeline** | ✅ Decisions & Approvals | ✅ Processing & Scheduling | ❌ Restricted (Confidential) |
| **Yearbook Publishing** | ✅ Direct Publish & Review | ✅ Direct Publish & Review | 📝 Submit for Review |
| **Student Clubs** | ✅ Full Management | ✅ Full Management | 📝 Submit Proposals & Updates |
| **Classes & Timetables** | ✅ Master Schedule | ✅ Master Schedule | 👁️ View Only |

---

## ⚙️ Backend & Supabase Configuration

### 1. Environment Variables (`.env.local`)
Create or edit `.env.local` in your root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ytmylxemqrsjxdvrthxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ea_nRbXuSXCaepGyLlR4HA_i8ppg5B0
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ea_nRbXuSXCaepGyLlR4HA_i8ppg5B0
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. Database Schema Migration
Run the database migration SQL located at [`supabase/schema.sql`](supabase/schema.sql) in your [Supabase SQL Editor](https://supabase.com/dashboard/project/ytmylxemqrsjxdvrthxx/sql):
- Creates `user_profiles`, `campuses`, `yearbook_alumni`, `clubs`, `admissions`, `classes_courses`, and `bulletin_notices` tables.
- Configures Row Level Security (RLS) policies for Principal, Staff, and Student roles.
- Populates initial seed data for all 4 campuses, alumni scholars, clubs, and timetables.

### 3. Principal Master Login Credentials
- **Email**: `kaungmyat.htut@gmail.com`
- **Password**: `Kmh132546$`
- **Role**: `principal` (Superadmin)

---

## ☁️ Cloudflare Pages Deployment Guide

1. **Connect GitHub Repository**:
   - In Cloudflare Dashboard, go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
   - Select the `school-website` repository.

2. **Build Settings**:
   - **Framework Preset**: `Next.js`
   - **Build Command**: `npx @cloudflare/next-on-pages` or standard `npm run build`
   - **Build Output Directory**: `.vercel/output/static` (for next-on-pages) or `out`

3. **Environment Variables on Cloudflare**:
   Add the following environment variables in **Settings > Environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://ytmylxemqrsjxdvrthxx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `sb_publishable_ea_nRbXuSXCaepGyLlR4HA_i8ppg5B0`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your_supabase_service_role_key_here`
   - `NODE_VERSION`: `20`

---

## 🧭 Project Architecture

```
school-website/
├── app/
│   ├── campuses/            # Public 4-campuses showcase (Yangon & Mawlamyine)
│   ├── yearbook/            # Alumni Yearbook & University Placements
│   ├── clubs/               # Student Clubs & Societies
│   ├── admission/           # 4-Step Student Admission Wizard
│   ├── classes/             # Timetables & Pearson Edexcel Syllabi
│   ├── chatbot/             # AI Academic Counselor standalone page
│   ├── api/
│   │   ├── admin/users/     # User Provisioning API with RBAC enforcement
│   │   ├── chatbot/         # AI Consultation endpoint
│   ├── admin/               # Role-Based Management Portal
│   │   ├── login/           # Secure Login Form with Password & Magic Link
│   │   ├── users/           # User Provisioning & Account Management
│   │   ├── admissions/      # Admission Pipeline & Assessment Booking
│   │   ├── campuses/        # Campus Directory CRUD
│   │   ├── yearbook/        # Review Queue & Alumni Submissions
│   │   ├── clubs/           # Student Society Activity Proposals
│   │   └── classes/         # Course Scheduling
├── lib/
│   └── supabase/
│       ├── client.ts        # Browser client singleton
│       ├── server.ts        # Server Component SSR client
│       ├── admin.ts         # Server-only Service Role client
│       └── types.ts         # TypeScript schema definitions
├── middleware.ts            # Route protection for /admin/*
├── supabase/
│   └── schema.sql           # Complete PostgreSQL Schema & RLS Policies
```
