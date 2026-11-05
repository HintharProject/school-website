# Hinthar International School — Master Product & Technical Specification (`spec.md`)

> **LIVING SPECIFICATION MANDATE**: This file is the single source of truth for routes, UI/UX tokens, bilingual rules, database tables, RBAC permissions, and Admin CMS mappings. **Every modification to routes, database schema, UI design tokens, copy rules, or workflows MUST update both `spec.md` and `AGENTS.md` in the exact same task.**

---

## 1. Product Vision & Goals

1. **Impress & Inform Visitors Instantly**: Present **Hinthar International School** (Yangon & Mawlamyine) as a prestigious, trustworthy Pearson Edexcel institution with a crisp, fast-loading, white-first editorial aesthetic matching `Hinthar_logo.png`.
2. **Minimal Public Surface (5 Pages Only)**: Eliminate navigation clutter, dropdown menus, and dead modules by consolidating the entire public website into 5 focused pages.
3. **100% Admin-Editable Website Data**: Empower non-technical school administrators to edit every single public text, statistic, photo, campus, Pearson pathway/subject, student yearbook entry, club, activity, testimonial, FAQ, contact detail, and admission dropdown from `/admin` without touching code or breaking layouts.
4. **Accurate Pearson-Only Curriculum & Natural Bilingual (`EN` / `MY`) Copy**: Strictly reflect Pearson Edexcel pathways (`Lower Secondary Year 7–9`, `Pearson Edexcel IGCSE`, `Pearson Edexcel IAL`) and maintain natural Burmese phrasing with zero awkward literal translations of proper nouns.

---

## 2. Public Route Architecture (5 Pages Only) & Legacy Redirects

### Active Public Routes

| # | Route | Navbar Label (`EN` / `MY`) | Purpose & Sections |
| :- | :--- | :--- | :--- |
| 1 | `/` | `Home` / `ပင်မစာမျက်နှာ` | **1.** Top Announcement Ticker · **2.** Split/Framed Hero + 4 Key Highlight Stats · **3.** About Hinthar & Principal Welcome · **4.** `#classes` Classes & Pearson Academic Pathways (interactive cards + Syllabus/Subject Modal) · **5.** Campuses Overview Strip · **6.** Parent & Alumni Testimonials · **7.** FAQs Accordion |
| 2 | `/campuses` | `Campuses` / `ကျောင်းခွဲများ` | Dynamic campus directory (seeded with 4 Yangon campuses: Shwe Hinthar, Ywarma, Shwe Padauk, Shwe Pone Nyet + 1 Mawlamyine IS Licensed campus), city filter pills, cover + multi-photo Gallery Lightbox, facilities tags, grades served, phone/email, and Google Maps link |
| 3 | `/yearbook` | `Yearbook` / `ကျောင်းသား နှစ်ချုပ်မှတ်တမ်း` | **Student Yearbook Only** (no staff directory): filter by Region (`All`, `Yangon`, `Mawlamyine`), Batch (`Class of 2026`, `2025`, etc.), and search; displays portrait, honor/role badge, Pearson subjects, optional university destination, and quote (`EN`/`MY`) |
| 4 | `/clubs` | `Clubs & Activities` / `အသင်းအဖွဲ့နှင့် လှုပ်ရှားမှုများ` | Single unified scrollable page: **Top** — Student Clubs & Societies (schedule, leaders, member count, gallery, linked events); **Bottom (`#activities`)** — School Activities & Events calendar highlights |
| 5 | `/admission` | `Admissions` / `ကျောင်းဝင်ခွင့်` *(Gold CTA Button)* | Top segmented switcher: **`Apply Online`** (Streamlined 3-Step Pearson Application + Admin-configurable optional/required R2 document uploads + `HIS-YYYY-XXXXXX` receipt) & **`Track Status`** (`?tab=track` — rate-limited lookup via reference code + guardian email) |

### Permanent `308` Legacy Redirects (`next.config.ts`)
- `/classes` → `/#classes`
- `/portal` → `/admission?tab=track`
- `/activities` → `/clubs#activities`
- `/staff` → `/#about`
- `/news` & `/news/:slug*` → `/`
- `/chatbot` → `/`

---

## 3. Brand Visual System (`/ui-ux-pro-max` + `Hinthar_logo.png`)

### Color Tokens (Derived from `public/images/Hinthar_logo.png` & `Logo_var.png`)
- **Primary Canvas (`--surface-canvas`)**: `#FFFFFF` (Crisp pure white matching emblem interior)
- **Subtle Alternating Surface (`--surface-subtle`)**: `#F8FAFC`
- **Hinthar Royal Cobalt Blue (`--brand-blue`)**: `#193E8A` (Emblem crest & wings)
- **Deep Royal Anchor (`--brand-blue-deep`)**: `#0F2759` (Hover states, top ticker, footer)
- **Soft Cobalt Tint (`--brand-blue-soft`)**: `#EDF3FF` (Subtle badges, active filter pills)
- **Hinthar Luminous Gold (`--brand-gold`)**: `#FFD600` (Emblem outline — used for primary CTAs & accents; **must always pair with `#162033` dark ink for ≥ 13:1 WCAG AAA contrast**)
- **Accessible Gold Text (`--brand-gold-ink`)**: `#8A6100` (Used when gold semantic emphasis appears as text on white surfaces, ≥ 5.3:1 contrast)
- **Charcoal Primary Ink (`--ink-primary`)**: `#1E232B` (Matching `Logo_var.png` ring & wordmark)
- **Muted Slate Ink (`--ink-muted`)**: `#475569`

### Typography & Iconography
- **English Display / Headings**: `Outfit` (`600`–`800`), self-hosted via `next/font/google`.
- **English Body / UI**: `Inter` (`400`–`600`), self-hosted via `next/font/google`.
- **Myanmar (`my` locale)**: `Noto Sans Myanmar` (`400`–`700`), self-hosted via `next/font/google`, enforcing `line-height: 1.8` and `letter-spacing: 0` so stacked Myanmar diacritics never clip.
- **Icons**: `@phosphor-icons/react` vector SVGs (`aria-hidden="true"` on decorative icons). External icon fonts (Material Symbols) and structural emojis are strictly prohibited.
- **Navigation Rule**: Top desktop header uses a single flat horizontal row (`Home`, `Campuses`, `Yearbook`, `Clubs & Activities` + `EN/မြန်မာ` + `Admissions` CTA) with **zero dropdown menus** (`Classes` stays exclusively in the Home `#classes` section, not in the top navbar).

---

## 4. Bilingual (`EN` / `MY`) & Factual Accuracy Rules

1. **Do-Not-Translate Proper Nouns**:
   - School Name: Always **`Hinthar International School`** in both `EN` and `MY` locales (never translate to `"ဟင်္သာ နိုင်ငံတကာကျောင်း"` unless explicitly overridden by Admin).
   - Qualifications & Codes: Keep **`Pearson Edexcel`**, **`Lower Secondary (Year 7–9)`**, **`IGCSE`**, **`IAL`**, **`A-Level`**, **`STEM`**, and subject codes (`4PM1`, `4PH1`, `WMA11`, etc.) in English inside Burmese sentences.
   - People & Club Proper Names: Keep personal names (`Dr. Kaung Myat Htut`, student names) and official English society titles in English unless a specific Myanmar title is intentionally entered.
2. **Strictly Pearson Edexcel Continuum**:
   - Hinthar offers Pearson Edexcel pathways only (`Lower Secondary Year 7–9`, `Pearson Edexcel IGCSE`, `Pearson Edexcel IAL`). Non-Pearson categories (`Cambridge`, `Vocational`, `Foundation`) are excluded.
3. **Graceful Fallback & Admin Visibility**:
   - Every public dynamic field supports side-by-side `EN` (required) and `MY` (optional).
   - If a `MY` field is empty, `locField(locale, en, my)` falls back cleanly to `EN`.
   - In `/admin`, any empty `MY` field displays a non-blocking **`Needs Burmese`** indicator badge so administrators can spot missing translations immediately.
4. **Zero-Flash Locale Rendering**:
   - Locale preference is stored in the `hinthar-locale` cookie (`en` | `my`) and read on the server so SSR HTML matches the user's chosen language on first paint without post-hydration text flashing.

---

## 5. Normalized Cloudflare D1 Schema (`lib/db/schema.ts` — 14 Tables)

1. `user` — Better Auth users (`role`: `"admin"` | `"student"`, `status`: `"active"` | `"inactive"` | `"suspended"`).
2. `session` — Better Auth active sessions.
3. `account` — Credential password hashes (`local:credential`).
4. `verification` — Better Auth tokens.
5. `invitation` — Single-use account provisioning tokens (`admin` / `student`).
6. `audit_logs` — Immutable administrative & contributor mutation log.
7. `site_content` — Key-value JSON CMS store (`key`, `value`, `updatedBy`, `updatedAt`) backed by strict Zod schemas and compiled defaults in `lib/content/defaults.ts`. Keys:
   - `brand` (School name, subtitle, logo URL, footer blurb, phones, emails, address summary, social links)
   - `announcements` (Top ticker items `EN`/`MY` + active toggle)
   - `hero` (Intake badge, headline lines, subtitle, hero image URL, primary/secondary CTA labels, trust note, 4 key highlight stat cards `EN`/`MY`)
   - `aboutPrincipal` (Section badge, title, paragraphs, campus CTA label, Principal name, role, portrait URL, quote, and 3 academic stat cards `EN`/`MY`)
   - `homeSections` (Headings & subtitles for Home `#classes`, Campuses preview, Testimonials, and FAQs `EN`/`MY`)
   - `campusesPage` (Page badge, title, subtitle `EN`/`MY`)
   - `yearbookPage` (Page badge, title, subtitle `EN`/`MY`)
   - `clubsPage` (Page badge, title, subtitle, activities section heading/subtitle `EN`/`MY`)
   - `admissionsConfig` (Page headings, intake terms, study modes, academic streams, guardian relationships, and `documentRules`: `{ identityRequired, reportRequired, photoRequired }`)
   - `faqs` (Ordered list of `EN`/`MY` FAQ items)
8. `campuses` — Dynamic campus records (`id`, `name`, `nameMy`, `city`, `tagline`, `taglineMy`, `address`, `addressMy`, `phone`, `email`, `gradesServed`, `gradesServedMy`, `facilitiesEn`, `facilitiesMy`, `imageUrl`, `galleryUrls`, `mapUrl`, `sortOrder`, `isActive`).
9. `academic_programs` — Unified Pearson pathways (`id`, `nameEn`, `nameMy`, `badgeEn`, `badgeMy`, `ageRangeEn`, `ageRangeMy`, `summaryEn`, `summaryMy`, `descriptionEn`, `descriptionMy`, `highlightsEn`, `highlightsMy`, `curriculum`, `duration`, `campus`, `studyMode`, `programLevel`, `imageUrl`, `sortOrder`, `isActive`). Powers **both** Home `#classes` and `/admission`!
10. `academic_subjects` — Pearson subjects (`id`, `nameEn`, `nameMy`, `code`, `level`, `track`, `isActive`).
11. `program_subject_links` — Many-to-many join between `academic_programs` and `academic_subjects`.
12. `testimonials` — Parent & student quotes (`authorName`, `authorRole`, `authorRoleMy`, `quote`, `quoteMy`, `image`, `rating`, `sortOrder`, `status`).
13. `yearbook_batches` & `yearbook_alumni` *(2 tables)* — Regional batches (`Yangon` / `Mawlamyine`) and student entries (`name`, `batchId`, `role`, `roleMy`, `destination`, `subjects`, `quote`, `quoteMy`, `image`, `badge`, `campus`, `status`, `submittedBy`, `reviewerNotes`).
14. `clubs`, `club_members`, `activities`, `admissions`, `admission_upload_limits`, `file_assets` *(domain operational & R2 metadata tables)* — Note: total logical schema comprises 5 auth tables + 1 audit table + 1 CMS table + 12 domain/storage tables (19 SQLite tables total, zero legacy dead tables).

*(Dropped legacy tables: `news_posts`, `staff_profiles`, `newsletter_subscribers`, `bulletin_notices`, `notices`, `notice_reads`, `classes_courses`.)*

---

## 6. Role-Based Access Control (RBAC) & Page-Mirrored Admin Portal

### Roles
1. **School Administrator (`admin`)**:
   - Master bootstrap account: `thawyezaw@gmail.com` (`INITIAL_ADMIN_EMAIL`).
   - Full CRUD over 100% of website content, media uploads (`R2`), campuses, Pearson pathways/subjects, yearbook, clubs/activities, admissions pipeline, and user invitations.
   - **Anti-Lockout Invariant**: `assertNotLastAdmin()` strictly prevents deleting, suspending, or demoting the last active `admin`.
2. **Student Contributor (`student`)**:
   - Provisioned via single-use invitation only.
   - Can **only** access `/admin` (Contributor Hub), `/admin/yearbook` (submit/edit own Yearbook draft → `pending_review`), `/admin/clubs` (propose/edit Club & Club Activity drafts → `pending_review`), and `/admin/update-password`.
   - Zero access to Home CMS, Campuses, Admissions, or User Management.

### Page-Mirrored Admin Sidebar (`admin` role)
1. **Overview & Approvals** (`/admin`) — Live metrics, unified Pending Review Queue (Yearbook, Clubs, Activities), and latest Admissions.
2. **Home & Classes** (`/admin/home`) — Visual sub-tabs for: *Brand & Ticker*, *Hero & Stats*, *About & Principal*, *Pearson Classes & Subjects*, *Testimonials*, *FAQs*, and *Footer & Contacts*.
3. **Campuses** (`/admin/campuses`) — Manage Yangon & Mawlamyine campuses, galleries, facilities, and map links.
4. **Yearbook** (`/admin/yearbook`) — Manage regional batches and student yearbook entries.
5. **Clubs & Activities** (`/admin/clubs`) — Manage clubs, member rosters, and school events.
6. **Admissions** (`/admin/admissions`) — Review pipeline (`Pending`, `Assessment Scheduled`, `Approved`, `Declined`), CSV export, dropdown options, and **Document Upload Required/Optional toggles**.
7. **Users** (`/admin/users`) — Single-use invitations and account management.

---

## 7. Performance & Caching Architecture

- **Tagged Read Cache (`lib/cache/publicCache.ts`)**: Public read queries use cached loaders (`unstable_cache` + isolate memory cache) tagged by domain (`site-content`, `campuses`, `programs`, `testimonials`, `yearbook`, `clubs`, `activities`). Every Admin mutation calls `invalidatePublicCache(...)` (`revalidateTag` + `revalidatePath`) so public pages load rapidly while reflecting Admin saves immediately.
- **Zero Render-Blocking Fonts**: Self-hosted `Outfit`, `Inter`, and `Noto Sans Myanmar` via `next/font/google`; zero external Google stylesheet `<link>` tags.
- **Optimized Static Media**: Heavy PNGs (`Dr_KMH.png`, `graduation.png`) are replaced in UI components by optimized WebP/AVIF assets (`< 200 KB`).

---

## 8. Living Change Log

- **2026-11-02 (Clean-Slate 5-Page Architecture)**: Initialized `spec.md`. Consolidated public site to 5 pages (`/`, `/campuses`, `/yearbook`, `/clubs`, `/admission`), unified Pearson-only academic catalog onto Home `#classes` + Admissions, defined `Hinthar_logo` white-first design tokens, established 100% Admin-editable bilingual CMS + streamlined Contributor portal, and enforced living spec synchronization.
- **2026-11-02 (Full Rebuild Implementation & Verification Completed)**:
  - **Schema & D1 Migration**: Authored and executed `drizzle/0012_clean_five_page_rebuild.sql` on local Cloudflare D1 state (`%LOCALAPPDATA%\hinthar-dev\wrangler-state`), cleanly establishing bilingual columns, Pearson academic programs, yearbook regional cohorts, and dropped 7 legacy tables (`news_posts`, `staff_profiles`, `newsletter_subscribers`, etc.).
  - **Global Layout & Assets**: Swapped external font stylesheet with `next/font/google` (`Outfit`, `Inter`, `Noto_Sans_Myanmar` with 1.8 line-height), generated optimized WebP images (`dr-kmh.webp`, `hinthar-logo.webp`), and replaced all Material Symbols with `@phosphor-icons/react` vector icons.
  - **Strictly 5 Public Pages Rebuilt**:
    - `/` (Home: Top Announcement Ticker, Framed Hero + 4 Stats, About Principal, `#classes` Pearson Pathways + Syllabus/Subject Modal, Campuses strip, Testimonials, FAQs)
    - `/campuses` (4 Campuses: 3 Yangon + 1 Mawlamyine, city filter, multi-photo Gallery Lightbox, map links)
    - `/yearbook` (Student Yearbook Only: Region + Batch cohorts, search, student quotes)
    - `/clubs` (Unified page: Clubs & Societies at top, `#activities` School Events below)
    - `/admission` (Segmented: 3-step online application with configurable R2 uploads and `HIS-YYYY-XXXXXX` reference code; live status tracker)
  - **Permanent Redirects**: Verified 308 redirects for `/classes` -> `/#classes`, `/portal` -> `/admission?tab=track`, `/activities` -> `/clubs#activities`, `/staff` -> `/#about`, `/news` -> `/`, `/chatbot` -> `/`.
  - **100% Page-Mirrored Admin Portal Rebuilt**:
    - `/admin` (Overview & Pending Review Queue for yearbook/clubs/activities submissions + latest admissions)
    - `/admin/home` (8 visual sub-tabs for Home & Classes CMS editing)
    - `/admin/campuses` (Campuses CRUD with `BilingualField`, gallery upload picker, and status toggles)
    - `/admin/yearbook` (Graduation batches and scholar profiles with bilingual fields and status workflow)
    - `/admin/clubs` (Clubs CRUD, member rosters, and school activities)
    - `/admin/admissions` (Admissions pipeline, status updater, assessment scheduler, CSV export, and Form & Document Upload Settings)
    - `/admin/users` (Account management and single-use invitation provisioning with `assertNotLastAdmin()`)
  - **Compiler & Build Verification**: `npx tsc --noEmit` and `npm run build` pass with 0 errors across all 25 public, admin, and API routes.

- **2026-11-02 (Hero Typography Optimization)**: Refined Hero section primary heading scale and line-height in [HeroSection.tsx](app/components/sections/HeroSection.tsx). Adjusted desktop size from 52px down to a balanced locale-aware scale (Burmese 36px/40px with 1.34 line-height and normal tracking; English 40px/44px with 1.16 line-height) so institutional headlines fit cleanly on two lines without orphaned single-word line breaks.
- **2026-11-02 (Streamlined Compact Headers & Combined Clubs/Activities View)**: Addressed oversized "zoomed-in" inner page banners across [CampusesView.tsx](app/campuses/CampusesView.tsx), [YearbookView.tsx](app/yearbook/YearbookView.tsx), [ClubsActivitiesView.tsx](app/clubs/ClubsActivitiesView.tsx), and [AdmissionPortalView.tsx](app/admission/AdmissionPortalView.tsx). Reduced vertical padding (pt-6/pb-6) and scaled typography (28–34px) so the first row of cards is immediately visible above the fold on laptop displays without scrolling. Re-architected `/clubs` into a unified interactive view with top segment tabs (`All`, `Clubs & Societies`, `School Activities`) and instant category/status sub-filters.
- **2026-11-05 (Authentic School Data, 5 Campuses & Pearson Pathways)**: Integrated real Facebook announcement data across seed and default content stores:
  - **5 Campuses**: Added `Shwe Hinthar Campus` in Yangon (expanding to 4 Yangon campuses + 1 Mawlamyine IS Licensed campus).
  - **Academic Programs & Syllabi**: Added 6-Month Fast-Track (Year 7–9 Pre-IGCSE with Practical Python Programming) and 2-Year Weekend Budget IGCSE; expanded subjects to 22 (adding Human Biology, Environmental Management, Travel & Tourism, Sociology, 3D Arts).
  - **Real Alumni Placements**: Added authentic placements including MIT, UC Berkeley, KIT/DIT Germany, Shizuoka 100% Scholarship, Tongji MBBS, and Ko Thaw Ye Zaw (Highest Mark in the World in Pearson Edexcel A-Level IT).
  - **Authentic Activities**: Added ICSC 2026 Awards, Hinthar Tech Hackathon 2026, Thadingyut Acariya Puja, Gallery Ohnmmar Art Trip, and EduLink Masterclass.
  - **Hotline & Admissions**: Synchronized contact numbers to `09 894 33 22 00` / `09 894 33 22 99` (Open 7 days a week, 9:00 AM – 4:00 PM), updated FAQs with zero hidden fees and free graduation guest policy.
  - **Database Sync**: Successfully seeded both local D1 state and remote production Cloudflare D1 database `hinthar-db`.
