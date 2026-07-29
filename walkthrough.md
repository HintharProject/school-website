# Hinthar Education UI — Walkthrough

## Project Overview

A complete front-end UI for Hinthar International School, built with **Next.js 16 (App Router)**, **Tailwind CSS**, and **Google Material Symbols**. The design uses a **Navy Blue & Gold** color scheme with **toggleable Light/Dark mode**.

---

## Routes

### Public Pages

| Route | Description |
|---|---|
| `/` | Landing page (Hero, About, Specialisations, FAQ) |
| `/yearbook` | Alumni gallery with search & category filter |
| `/classes` | Tabbed interface: course schedules + announcements |
| `/clubs` | Club showcase cards with images & details |
| `/admission` | Single-page admission form with file drag-and-drop |
| `/activities` | Coming soon placeholder |
| `/chatbot` | Coming soon placeholder |

### Admin Pages (all under `/admin`)

| Route | Description |
|---|---|
| `/admin/login` | Staff authentication form |
| `/admin` | Dashboard overview with stats & quick actions |
| `/admin/admissions` | Admissions review table with status badges |
| `/admin/yearbook` | Yearbook entries — list / new / edit |
| `/admin/classes` | Courses & announcements — list / new / edit |
| `/admin/clubs` | Clubs — list / new / edit |

---

## Design System

- **Colors**: Navy Blue (`oxford-blue`, `primary`) & Gold (`academic-gold`)
- **Typography**: `Outfit` (headings) + `Inter` (body)
- **Icons**: Google Material Symbols (`material-symbols-outlined`)
- **Components**: Cards use `bg-surface dark:bg-surface-variant`, `rounded-2xl`, `border border-outline-variant/30`
- **Forms**: Consistent input/button/label styles across all pages

## Build

```bash
npm run build   # Compiles with zero TypeScript errors
npm run dev     # Start development server
```
