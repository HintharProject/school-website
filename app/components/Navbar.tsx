"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  List,
  X,
  Translate,
  IdentificationBadge,
} from "@phosphor-icons/react";
import { useLocale, useT } from "@/lib/i18n/useT";
import { locField } from "@/lib/i18n/loc";
import type { TranslateKey } from "@/lib/i18n";
import {
  DEFAULT_BRAND_AND_FOOTER,
  type BrandAndFooterContent,
} from "@/lib/content/defaults";
import LanguageToggle from "./LanguageToggle";

interface NavItem {
  labelKey: TranslateKey;
  href: string;
}

/**
 * Strictly 4 flat navigation links per approved 5-page architecture.
 * Zero dropdowns; `Classes` lives on Home (`/#classes`) and `Admissions` is the Gold CTA.
 */
const NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.campuses", href: "/campuses" },
  { labelKey: "nav.yearbook", href: "/yearbook" },
  { labelKey: "nav.clubs", href: "/clubs" },
];

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Navbar({
  brand = DEFAULT_BRAND_AND_FOOTER,
}: {
  brand?: BrandAndFooterContent;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const locale = useLocale();
  const t = useT();

  const subtitle = locField(locale, brand.subtitleEn, brand.subtitleMy);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) {
      const id = window.setTimeout(() => closeBtnRef.current?.focus(), 100);
      return () => window.clearTimeout(id);
    }
  }, [mobileOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileOpen) closeMobile();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, closeMobile]);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <header
        id="main-header"
        className={`sticky top-0 left-0 w-full z-[90] bg-white/95 backdrop-blur-md transition-shadow duration-200 border-b ${
          isScrolled
            ? "shadow-sm border-slate-200/90"
            : "border-slate-200/70"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4">
          {/* Left: Official Hinthar Logo & English Brand Name */}
          <Link
            href="/"
            className="flex items-center gap-3 group min-w-0 shrink-0"
          >
            <div className="relative h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-full overflow-hidden bg-white ring-2 ring-[#FFD600] shadow-xs transition-transform duration-200 group-hover:scale-105">
              <Image
                src={brand.logoUrl || "/images/hinthar-logo.webp"}
                alt={brand.schoolName}
                fill
                sizes="44px"
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold tracking-tight text-[#193E8A] text-sm sm:text-base md:text-[17px] leading-tight truncate">
                {brand.schoolName}
              </span>
              <span className="hidden sm:block text-[11px] font-semibold text-slate-600 leading-tight truncate">
                {subtitle}
              </span>
            </div>
          </Link>

          {/* Center: 4 Clean Flat Navigation Links */}
          <nav
            aria-label="Primary"
            className="hidden lg:flex items-center gap-1 rounded-full bg-slate-100/90 border border-slate-200/80 p-1"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    active
                      ? "bg-[#193E8A] text-white shadow-xs"
                      : "text-[#1E232B] hover:text-[#193E8A] hover:bg-white"
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>

          {/* Right: Language Toggle & Gold Admissions CTA */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <LanguageToggle />
            <Link
              href="/admission"
              className="inline-flex items-center justify-center gap-2 min-h-10 px-5 py-2.5 rounded-full text-xs font-extrabold bg-[#FFD600] hover:bg-[#ECC300] text-[#162033] shadow-xs hover:shadow-md transition-all active:scale-[0.98] whitespace-nowrap"
            >
              <span>{t("nav.admissions")}</span>
              <ArrowRight className="w-4 h-4 shrink-0" weight="bold" />
            </Link>
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <LanguageToggle />
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t("nav.openMenu")}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className="inline-flex items-center justify-center h-11 w-11 rounded-xl text-[#193E8A] hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer touch-manipulation"
            >
              <List className="w-6 h-6" weight="bold" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-[110] lg:hidden transition-[visibility,opacity] duration-250 ${
          mobileOpen
            ? "visible opacity-100"
            : "invisible opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label={t("nav.closeMenu")}
          tabIndex={mobileOpen ? 0 : -1}
          onClick={closeMobile}
          className="absolute inset-0 bg-[#0F2759]/55 backdrop-blur-xs"
        />

        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={`absolute top-0 right-0 h-[100dvh] w-[88%] max-w-[340px] bg-white shadow-2xl flex flex-col transition-transform duration-250 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white ring-2 ring-[#FFD600] shrink-0">
                <Image
                  src={brand.logoUrl || "/images/hinthar-logo.webp"}
                  alt={brand.schoolName}
                  fill
                  sizes="36px"
                  className="object-contain p-0.5"
                />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-sm text-[#193E8A] truncate">
                  {brand.schoolName}
                </p>
                <p className="text-[11px] font-medium text-slate-500 truncate">
                  Pearson Edexcel Centre
                </p>
              </div>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={closeMobile}
              aria-label={t("nav.closeMenu")}
              className="inline-flex items-center justify-center h-10 w-10 rounded-xl text-slate-500 hover:text-[#193E8A] hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" weight="bold" />
            </button>
          </div>

          <nav
            aria-label="Mobile"
            className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5"
          >
            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 mb-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 inline-flex items-center gap-2">
                <Translate className="w-4 h-4 text-[#193E8A]" weight="bold" />
                {t("nav.language")}
              </span>
              <LanguageToggle />
            </div>

            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between gap-3 min-h-12 px-4 rounded-xl text-sm font-bold transition-colors ${
                    active
                      ? "bg-[#193E8A] text-white shadow-xs"
                      : "text-[#1E232B] hover:bg-slate-100 hover:text-[#193E8A]"
                  }`}
                >
                  <span>{t(item.labelKey)}</span>
                  <ArrowRight className="w-4 h-4 opacity-70 shrink-0" weight="bold" />
                </Link>
              );
            })}

            <div className="pt-5 mt-5 border-t border-slate-200 space-y-2.5">
              <Link
                href="/admission"
                onClick={closeMobile}
                className="flex items-center justify-center gap-2 w-full min-h-12 bg-[#FFD600] hover:bg-[#ECC300] text-[#162033] px-4 py-3 rounded-xl text-sm font-extrabold shadow-xs transition-all"
              >
                <span>{t("nav.admissions")}</span>
                <ArrowRight className="w-4 h-4 shrink-0" weight="bold" />
              </Link>

              <Link
                href="/admission?tab=track"
                onClick={closeMobile}
                className="flex items-center justify-center gap-2 w-full min-h-11 bg-[#EEF3FC] hover:bg-slate-200/70 text-[#193E8A] px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
              >
                <IdentificationBadge className="w-4 h-4 shrink-0" weight="duotone" />
                <span>{t("footer.trackApplication")}</span>
              </Link>
            </div>
          </nav>

          <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 text-center">
            <p className="text-[11px] font-medium text-slate-500">
              © {new Date().getFullYear()} {brand.schoolName}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
