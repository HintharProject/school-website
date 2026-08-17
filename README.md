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
