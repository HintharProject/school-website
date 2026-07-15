# Hinthar Education — School Website

The official public-facing website for **[Hinthar Education](https://hinthar.education/)**. This repository contains the main landing page, the admissions & enrollment portal, and the Consultation AI interface that helps prospective students and parents engage with the school.

---

## Tech Stack

| Category          | Technology                                                                 |
| ----------------- | -------------------------------------------------------------------------- |
| Framework         | [Next.js](https://nextjs.org/)                                             |
| Styling           | [Tailwind CSS](https://tailwindcss.com/)                                   |
| UI Components     | [Shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| Icons             | [Lucide React](https://lucide.dev/)                                        |
| Animations        | [Framer Motion](https://www.framer.com/motion/)                            |
| Hosting           | [Vercel](https://vercel.com/)                                              |

---

## Team

| Role            | Member              |
| --------------- | ------------------- |
| Front End Dev   | Nyan Lin Htet       |
| Front End Dev   | Khant Phone Zayar   |

---

## Prerequisites

Before you begin, ensure your machine has the following installed:

- **Node.js** `>= 18.x` (LTS recommended)
- **npm** `>= 9.x` (ships with Node.js)
- **Git**

Verify your environment:

```bash
node -v   # ≥ 18
npm -v    # ≥ 9
git --version
```

---

## Local Development

### 1. Clone the Repository

```bash
git clone <repo-url> school-website
cd school-website
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Hot reload is enabled by default — changes to `app/` pages are reflected instantly.

### 4. Build for Production

```bash
npm run build
npm start
```

---

## Project Structure (Overview)

```
school-website/
├── app/                # Next.js App Router pages & layouts
├── components/         # Reusable UI components (Shadcn/ui, custom)
├── lib/                # Utility functions & shared logic
├── public/             # Static assets (images, fonts, etc.)
├── next.config.ts      # Next.js configuration
├── tailwind.config.ts  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

---

## Deployment

This project is deployed on **Vercel**. Pushes to the `main` branch trigger automatic deployments. Preview deployments are created for every pull request.

---

## Related Links

- [Hinthar Education Website](https://hinthar.education/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com/docs)
