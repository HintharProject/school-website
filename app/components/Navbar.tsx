"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/useT";
import LanguageToggle from "./LanguageToggle";

interface NavItem {
  labelKey: import("@/lib/i18n").TranslateKey;
  href: string;
}

const mainNavItems: NavItem[] = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.campuses", href: "/campuses" },
  { labelKey: "nav.yearbook", href: "/yearbook" },
  { labelKey: "nav.clubs", href: "/clubs" },
];

const moreNavItems: NavItem[] = [
  { labelKey: "nav.classes", href: "/classes" },
  { labelKey: "nav.activities", href: "/activities" },
  { labelKey: "nav.news", href: "/news" },
  { labelKey: "nav.staff", href: "/staff" },
  { labelKey: "footer.aiConsultation", href: "/chatbot" },
  { labelKey: "nav.studentPortal", href: "/portal" },
];

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const t = useT();

  const isTransparent = isHomePage && !isScrolled;
  const moreIsActive = moreNavItems.some((i) => isActivePath(pathname, i.href));

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Header scroll state
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Body scroll lock + scrollbar gutter compensation
  useEffect(() => {
    if (!mobileOpen) return;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
    // prevent iOS elastic scroll bounce
    document.documentElement.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      document.documentElement.style.overscrollBehavior = "";
    };
  }, [mobileOpen]);

  // Auto-focus close button when drawer opens (accessibility)
  useEffect(() => {
    if (mobileOpen) {
      const id = window.setTimeout(() => closeBtnRef.current?.focus(), 120);
      return () => window.clearTimeout(id);
    }
  }, [mobileOpen]);

  // Close mobile on breakpoint up to desktop (lg: 1024px)
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if ((e as MediaQueryListEvent).matches) setMobileOpen(false);
    };
    // modern + legacy
    if (mql.addEventListener) mql.addEventListener("change", onChange as (e: MediaQueryListEvent) => void);
    else mql.addListener(onChange as () => void);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange as (e: MediaQueryListEvent) => void);
      else mql.removeListener(onChange as () => void);
    };
  }, []);

  // Close "More" dropdown on outside click / Escape / route change
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (mobileOpen) closeMobile();
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen, closeMobile]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMoreOpen(false);
      setMobileOpen(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <header
        id="main-header"
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)] ${
          isTransparent
            ? "py-2.5 sm:py-3 md:py-4 bg-gradient-to-b from-[#09234b]/90 via-[#09234b]/40 to-transparent border-b border-transparent"
            : "py-2 sm:py-2.5 bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200"
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 flex items-center gap-2 sm:gap-3 lg:gap-4 min-h-[44px]">
          {/* Logo — compact on mobile, no overflow */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0"
          >
            <div className="relative h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 shrink-0 transition-transform duration-300 group-hover:scale-105 rounded-full overflow-hidden bg-white shadow-sm ring-2 ring-[#FFC700]/80">
              <Image
                src="/images/mainLogo.png"
                alt="Hinthar International School Logo"
                fill
                sizes="44px"
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span
                className={`font-black tracking-tight leading-none truncate transition-colors duration-300 text-[13px] sm:text-[15px] md:text-[17px] ${
                  isTransparent ? "text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]" : "text-[#0E3B7D]"
                }`}
              >
                Hinthar International
              </span>
              <span
                className={`hidden sm:flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-none mt-0.5 transition-colors duration-300 ${
                  isTransparent ? "text-[#FFC700]" : "text-[#164E9A]"
                }`}
              >
                <span>Pearson Edexcel</span>
                <span className="text-[8px] opacity-60">•</span>
                <span className="hidden md:inline">Year 7–9 · IGCSE · IAL</span>
                <span className="md:hidden">IGCSE · IAL</span>
              </span>
            </div>
          </Link>

          {/* Spacer — pushes nav to center, actions to right */}
          <div className="flex-1 hidden lg:block" aria-hidden />

          {/* Desktop Navigation — compact pill, grouped */}
          <nav
            aria-label="Primary"
            className={`hidden lg:flex items-center gap-1 p-1 rounded-full transition-all duration-300 shrink-0 ${
              isTransparent
                ? "bg-white/10 backdrop-blur-md border border-white/20"
                : "bg-slate-100/90 border border-slate-200"
            }`}
          >
            {mainNavItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all duration-200 whitespace-nowrap ${
                    active
                      ? isTransparent
                        ? "bg-[#FFC700] text-[#09234B] shadow-md"
                        : "bg-[#0E3B7D] text-white shadow-sm"
                      : isTransparent
                        ? "text-white/90 hover:text-white hover:bg-white/15"
                        : "text-slate-700 hover:text-[#0E3B7D] hover:bg-white"
                  }`}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}

            {/* More / Explore dropdown */}
            <div ref={moreRef} className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                className={`inline-flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all duration-200 whitespace-nowrap cursor-pointer touch-manipulation ${
                  moreIsActive
                    ? isTransparent
                      ? "bg-white/20 text-white ring-1 ring-white/30"
                      : "bg-white text-[#0E3B7D] shadow-sm ring-1 ring-slate-200"
                    : isTransparent
                      ? "text-white/90 hover:text-white hover:bg-white/15"
                      : "text-slate-700 hover:text-[#0E3B7D] hover:bg-white"
                }`}
              >
                <span>Explore</span>
                <span
                  aria-hidden="true"
                  className={`material-symbols-outlined text-sm transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`}
                >
                  expand_more
                </span>
              </button>

              {/* Dropdown panel */}
              <div
                role="menu"
                className={`absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden transition-all origin-top-right ${
                  moreOpen
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                }`}
              >
                <div className="p-1.5 space-y-0.5">
                  {moreNavItems.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                          active
                            ? "bg-[#0E3B7D] text-white shadow-sm"
                            : "text-slate-700 hover:bg-slate-100 hover:text-[#0E3B7D]"
                        }`}
                      >
                        <span>{t(item.labelKey)}</span>
                        <span aria-hidden="true" className="material-symbols-outlined text-sm opacity-60">
                          arrow_forward
                        </span>
                      </Link>
                    );
                  })}
                </div>
                <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm text-[#0E3B7D]">
                    school
                  </span>
                  <span>Pearson Edexcel Centre</span>
                </div>
              </div>
            </div>
          </nav>

          {/* Desktop actions — hidden on mobile, moved to drawer */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0 ml-4">
            <LanguageToggle />
            <Link
              href="/admission"
              className="inline-flex items-center justify-center gap-1.5 min-h-10 px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition-all duration-200 bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap border border-[#FFC700] shrink-0 touch-manipulation"
            >
              <span>{t("nav.applyNow")}</span>
              <span aria-hidden="true" className="material-symbols-outlined text-sm font-bold leading-none">
                arrow_forward
              </span>
            </Link>
          </div>

          {/* Mobile hamburger — only visible below lg */}
          <div className="flex items-center lg:hidden shrink-0 ml-auto">
            <button
              id="menu-toggle"
              onClick={() => setMobileOpen(true)}
              className={`inline-flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-xl transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC700] ${
                isTransparent
                  ? "text-white hover:bg-white/15 active:bg-white/20"
                  : "text-[#0E3B7D] hover:bg-slate-100 active:bg-slate-200"
              }`}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[26px] sm:text-[28px] leading-none">
                menu
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        id="mobile-menu-overlay"
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-[110] lg:hidden transition-[visibility,opacity] duration-300 ${
          mobileOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeMobile();
        }}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close navigation menu"
          tabIndex={mobileOpen ? 0 : -1}
          onClick={closeMobile}
          className="absolute inset-0 bg-[#09234B]/60 backdrop-blur-sm supports-[backdrop-filter]:bg-[#09234B]/55 cursor-default"
        />

        {/* Drawer panel */}
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={`absolute top-0 right-0 h-[100dvh] max-h-[100dvh] w-[88%] max-w-[340px] sm:max-w-sm bg-white shadow-2xl flex flex-col will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingRight: "env(safe-area-inset-right)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {/* Drawer header — sticky */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-slate-200 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-white ring-2 ring-[#FFC700] shrink-0">
                <Image src="/images/mainLogo.png" alt="Hinthar Logo" fill sizes="40px" className="object-contain p-0.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm sm:text-[15px] text-[#0E3B7D] tracking-tight leading-none truncate">
                  Hinthar School
                </span>
                <span className="text-[10px] font-bold text-[#0E3B7D]/70 uppercase tracking-wider leading-none mt-0.5">
                  Pearson Edexcel Center
                </span>
              </div>
            </div>
            <button
              ref={closeBtnRef}
              onClick={closeMobile}
              className="inline-flex items-center justify-center h-10 w-10 -mr-1 rounded-xl text-slate-500 hover:text-[#0E3B7D] hover:bg-slate-200 active:bg-slate-300 transition-colors shrink-0 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC700]"
              aria-label="Close menu"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-2xl leading-none">
                close
              </span>
            </button>
          </div>

          {/* Scrollable nav */}
          <nav
            aria-label="Mobile"
            className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-5 py-4 space-y-1"
            style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
          >
            {/* Language — mobile-only (moved from header) */}
            <div className="flex items-center justify-between gap-3 px-2 py-3 mb-2 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                <span aria-hidden="true" className="material-symbols-outlined text-sm text-[#0E3B7D]">translate</span>
                Language
              </p>
              <LanguageToggle />
            </div>
            <p className="px-2 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t("nav.menuPortals")}</p>

            {/* Main */}
            <p className="px-2 pt-3 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Main</p>
            {mainNavItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between gap-3 min-h-11 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all touch-manipulation active:scale-[0.99] ${
                    active ? "bg-[#0E3B7D] text-white shadow-sm" : "text-slate-700 hover:bg-slate-100 hover:text-[#0E3B7D] active:bg-slate-200"
                  }`}
                >
                  <span className="truncate">{t(item.labelKey)}</span>
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px] opacity-60 shrink-0 leading-none">
                    arrow_forward
                  </span>
                </Link>
              );
            })}

            {/* Explore */}
            <p className="px-2 pt-5 pb-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Explore</p>
            {moreNavItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between gap-3 min-h-11 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all touch-manipulation active:scale-[0.99] ${
                    active ? "bg-[#0E3B7D] text-white shadow-sm" : "text-slate-700 hover:bg-slate-100 hover:text-[#0E3B7D] active:bg-slate-200"
                  }`}
                >
                  <span className="truncate">{t(item.labelKey)}</span>
                  <span aria-hidden="true" className="material-symbols-outlined text-[18px] opacity-60 shrink-0 leading-none">
                    arrow_forward
                  </span>
                </Link>
              );
            })}

            {/* Mobile CTAs */}
            <div className="pt-6 mt-6 border-t border-slate-200 space-y-2.5 pb-2">
              <Link
                href="/admission"
                onClick={closeMobile}
                className="flex items-center justify-center gap-2 w-full min-h-11 bg-[#FFC700] hover:bg-[#E6B300] active:bg-[#D4A600] text-[#09234B] px-4 py-3 rounded-xl text-xs font-extrabold tracking-wider uppercase shadow-md active:scale-[0.98] transition-all touch-manipulation"
              >
                <span>{t("nav.applyForAdmission")}</span>
                <span aria-hidden="true" className="material-symbols-outlined text-base font-bold leading-none">
                  arrow_forward
                </span>
              </Link>
            </div>

            <p className="px-2 pt-4 pb-2 text-center text-[10px] font-medium text-slate-400">
              © {new Date().getFullYear()} Hinthar International School
            </p>
          </nav>
        </div>
      </div>
    </>
  );
}
