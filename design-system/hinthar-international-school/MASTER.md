# Hinthar International School — Master Design System (`MASTER.md`)

Generated and verified with `ui-ux-pro-max` (`Minimalism & Swiss Editorial` + `Hinthar_logo.png` brand tokens).

## 1. Visual Direction
- **Theme**: Crisp White-First Prestigious British Academy (`#FFFFFF` & `#F8FAFC` surfaces, matching the white interior of `Hinthar_logo.png`).
- **Hero Pattern**: Split / Framed Editorial Hero on crisp light canvas with Royal Cobalt Blue typography, Luminous Gold CTAs, framed campus/graduation photography, and a sleek Royal Blue Announcement Ticker at the very top.
- **Density & Rhythm**: Spacious editorial vertical rhythm (`py-16 md:py-24`), `max-w-7xl` (`1280px`) container, consistent `4px`/`8px` spacing scale, `rounded-2xl` / `rounded-3xl` cards with subtle `1px` `#E2E8F0` borders and restrained hover elevation.

## 2. Color Tokens (`Hinthar_logo.png` & `Logo_var.png`)

| Semantic Token | Hex | Usage | Contrast Invariant |
| :--- | :--- | :--- | :--- |
| `--brand-blue` | `#193E8A` | Primary headings, active pills, primary dark cards/badges | `9.8:1` on `#FFFFFF` (AAA) |
| `--brand-blue-deep` | `#0F2759` | Top ticker, footer surface, primary button hover | `14.1:1` on `#FFFFFF` (AAA) |
| `--brand-blue-soft` | `#EDF3FF` | Subtle section pills, icon containers, active filter backgrounds | Pair with `#193E8A` text (`8.5:1`) |
| `--brand-gold` | `#FFD600` | Primary CTA background, accent underlines, highlight badges | **Always** pair with `#162033` ink (`13.4:1` AAA); never white text on gold |
| `--brand-gold-hover` | `#F0C800` | Primary CTA hover/active background | Pair with `#162033` ink |
| `--brand-gold-ink` | `#8A6100` | Gold semantic text on white/light backgrounds | `5.4:1` on `#FFFFFF` (AA) |
| `--surface-canvas` | `#FFFFFF` | Primary page & card surface | — |
| `--surface-subtle` | `#F8FAFC` | Alternating section background | — |
| `--ink-primary` | `#1E232B` | Primary body & charcoal headings | `15.6:1` on `#FFFFFF` (AAA) |
| `--ink-muted` | `#475569` | Secondary descriptions & labels | `7.5:1` on `#FFFFFF` (AAA) |
| `--border-subtle` | `#E2E8F0` | Card & section dividers | — |

## 3. Typography & Bilingual Rules
- **Display / Headings (`EN`)**: `Outfit` (`600`, `700`, `800`), `tracking-tight`, `leading-[1.15]`.
- **Body / Controls (`EN`)**: `Inter` (`400`, `500`, `600`), `leading-relaxed`.
- **Myanmar (`MY`)**: `Noto Sans Myanmar` (`400`, `500`, `600`, `700`), `leading-[1.8]`, `tracking-normal` (never apply `uppercase` or tight negative tracking to Burmese text).
- **Proper Noun Rule**: Never translate `"Hinthar International School"`, `"Pearson Edexcel"`, `"IGCSE"`, `"IAL"`, or subject codes into Burmese.

## 4. Iconography & Accessibility Rules
- **Icon Library**: `@phosphor-icons/react` exclusively (`20px`–`24px` consistent sizing; `aria-hidden="true"` when decorative).
- **Prohibited**: External icon fonts (`Material Symbols Outlined`), emojis as structural icons, top-navbar dropdown menus, and layout-shifting hover transforms.
- **Interactive Targets**: Minimum `44x44px` touch targets on mobile/tablet, visible `focus-visible:ring-2 focus-visible:ring-[#193E8A]`, `cursor-pointer` on all interactive buttons/cards, and full `prefers-reduced-motion` support.

