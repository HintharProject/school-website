"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/useT";
import LanguageToggle from "./LanguageToggle";

interface NavItem {
  labelKey: import("@/lib/i18n").TranslateKey;
  href: string;
}

// Primary navigation — always visible on desktop
const mainNavItems: NavItem[] = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.campuses", href: "/campuses" },
  { labelKey: "nav.classes", href: "/classes" },
  { labelKey: "nav.activities", href: "/activities" },
  { labelKey: "nav.clubs", href: "/clubs" },
];

// Secondary navigation — collapsed into "Explore" dropdown on desktop,
// still shown flat in the mobile drawer
const moreNavItems: NavItem[] = [
  { labelKey: "nav.yearbook", href: "/yearbook" },
  { labelKey: "nav.news", href: "/news" },
  { labelKey: "nav.staff", href: "/staff" },
  { labelKey: "footer.aiConsultation", href: "/chatbot" },
];

const allNavItems: NavItem[] = [...mainNavItems, ...moreNavItems];

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const t = useT();

  const isTransparent = isHomePage && !isScrolled;
  const moreIsActive = moreNavItems.some((i) => isActivePath(pathname, i.href));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close "More" dropdown on outside click / Escape / route change
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        id="main-header"
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
          isTransparent
            ? "py-3 md:py-4 bg-gradient-to-b from-[#09234b]/90 via-[#09234b]/40 to-transparent border-b border-transparent"
            : "py-2.5 bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200"
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3 lg:gap-4">
          {/* Logo — fixed, never shrinks */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer shrink-0 min-w-0"
          >
            <div className="relative h-10 w-10 sm:h-11 sm:w-11 md:h-11 md:w-11 shrink-0 transition-transform duration-300 group-hover:scale-105 rounded-full overflow-hidden bg-white shadow-sm ring-2 ring-[#FFC700]/80">
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
                className={`font-black text-[15px] sm:text-[17px] md:text-lg tracking-tight leading-tight truncate transition-colors duration-300 ${
                  isTransparent ? "text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]" : "text-[#0E3B7D]"
                }`}
              >
                Hinthar International
              </span>
              <span
                className={`hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                  isTransparent ? "text-[#FFC700]" : "text-[#164E9A]"
                }`}
              >
                <span>Pearson Edexcel</span>
                <span className="text-[8px] opacity-60">•</span>
                <span>Year 7–9 · IGCSE · IAL</span>
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
                className={`inline-flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all duration-200 whitespace-nowrap cursor-pointer ${
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

          {/* Actions — never shrink, always visible */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto lg:ml-4">
            <LanguageToggle className="hidden sm:inline-flex" />

            <Link
              href="/admission"
              className="inline-flex items-center gap-1 sm:gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-extrabold tracking-wider uppercase transition-all duration-200 bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap border border-[#FFC700] shrink-0"
            >
              <span className="hidden sm:inline">{t("nav.applyNow")}</span>
              <span className="sm:hidden">Apply</span>
              <span aria-hidden="true" className="material-symbols-outlined text-sm font-bold">
                arrow_forward
              </span>
            </Link>

            <button
              id="menu-toggle"
              onClick={() => setMobileOpen(true)}
              className={`p-2 focus:outline-none lg:hidden rounded-xl transition-colors shrink-0 ${
                isTransparent ? "text-white hover:bg-white/15" : "text-[#0E3B7D] hover:bg-slate-100"
              }`}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[28px]">
                menu
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer — unchanged structure, grouped for clarity */}
      <div
        id="mobile-menu-overlay"
        className={`fixed inset-0 z-[110] transition-all duration-300 ${
          mobileOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setMobileOpen(false);
        }}
      >
        <div className="absolute inset-0 bg-[#09234B]/60 backdrop-blur-sm" />
        <div
          id="mobile-menu"
          className={`absolute top-0 right-0 h-full w-[86%] max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-5 flex justify-between items-center border-b border-slate-200 bg-slate-50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white ring-2 ring-[#FFC700] shrink-0">
                <Image src="/images/mainLogo.png" alt="Hinthar Logo" fill sizes="36px" className="object-contain p-0.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm text-[#0E3B7D] tracking-tight">Hinthar School</span>
                <span className="text-[10px] font-bold text-[#FFC700] uppercase tracking-wider">Pearson Edexcel Center</span>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-slate-500 hover:text-[#0E3B7D] p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              aria-label="Close menu"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-2xl">
                close
              </span>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-5 space-y-1">
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t("nav.menuPortals")}</p>
              <LanguageToggle />
            </div>

            {/* Main */}
            <p className="px-3 pt-2 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Main</p>
            {mainNavItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between py-3 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
                    active ? "bg-[#0E3B7D] text-white shadow-sm" : "text-slate-700 hover:bg-slate-100 hover:text-[#0E3B7D]"
                  }`}
                >
                  <span>{t(item.labelKey)}</span>
                  <span aria-hidden="true" className="material-symbols-outlined text-xs opacity-60">
                    arrow_forward
                  </span>
                </Link>
              );
            })}

            {/* Explore */}
            <p className="px-3 pt-4 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-widest">Explore</p>
            {moreNavItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between py-3 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
                    active ? "bg-[#0E3B7D] text-white shadow-sm" : "text-slate-700 hover:bg-slate-100 hover:text-[#0E3B7D]"
                  }`}
                >
                  <span>{t(item.labelKey)}</span>
                  <span aria-hidden="true" className="material-symbols-outlined text-xs opacity-60">
                    arrow_forward
                  </span>
                </Link>
              );
            })}

            <div className="pt-6 mt-6 border-t border-slate-200 space-y-2.5">
              <Link
                href="/admission"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] py-3 rounded-xl text-xs font-extrabold tracking-wider uppercase shadow-md active:scale-95 transition-all"
              >
                <span>{t("nav.applyForAdmission")}</span>
                <span aria-hidden="true" className="material-symbols-outlined text-base font-bold">
                  arrow_forward
                </span>
              </Link>
              <Link
                href="/portal"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold tracking-wider uppercase border border-slate-200 hover:text-[#0E3B7D] transition-all"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">
                  manage_accounts
                </span>
                <span>{t("nav.studentPortal")}</span>
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold tracking-wider uppercase border border-slate-200 hover:text-[#0E3B7D] transition-all"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">
                  admin_panel_settings
                </span>
                <span>{t("nav.staffAdminPortal")}</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
