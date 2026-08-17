"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Campuses", href: "/campuses" },
  { label: "Classes", href: "/classes" },
  { label: "Admissions", href: "/admission" },
  { label: "Activities", href: "/activities" },
  { label: "Clubs", href: "/clubs" },
  { label: "Yearbook", href: "/yearbook" },
  { label: "AI Consult", href: "/chatbot" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isTransparent = isHomePage && !isScrolled;

  return (
    <>
      {/* ── Top Header Bar ───────────────────────────────────────── */}
      <header
        id="main-header"
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${
          isTransparent
            ? "py-4 md:py-5 bg-gradient-to-b from-[#09234b]/90 via-[#09234b]/40 to-transparent"
            : "py-3 bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200"
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo & School Name */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative h-11 w-11 md:h-12 md:w-12 transition-transform duration-300 group-hover:scale-105 rounded-full overflow-hidden bg-white shadow-sm ring-2 ring-[#FFC700]/80">
              <Image
                src="/images/mainLogo.png"
                alt="Hinthar International School Logo"
                fill
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span
                className={`font-black text-base sm:text-lg md:text-xl tracking-tight leading-tight transition-colors duration-300 ${
                  isTransparent ? "text-white text-shadow-md" : "text-[#0E3B7D]"
                }`}
              >
                Hinthar International School
              </span>
              <span
                className={`hidden sm:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                  isTransparent ? "text-[#FFC700]" : "text-[#164E9A]"
                }`}
              >
                <span>Pearson Edexcel</span>
                <span className="text-[9px] opacity-60">•</span>
                <span>Year 7–9 · IGCSE · IAL</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className={`hidden xl:flex items-center gap-1 p-1 rounded-full transition-all duration-300 ${
              isTransparent
                ? "bg-white/10 backdrop-blur-md border border-white/20"
                : "bg-slate-100/90 border border-slate-200"
            }`}
          >
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? isTransparent
                        ? "bg-[#FFC700] text-[#09234B] shadow-md scale-105"
                        : "bg-[#0E3B7D] text-white shadow-sm"
                      : isTransparent
                      ? "text-white/90 hover:text-white hover:bg-white/15"
                      : "text-slate-700 hover:text-[#0E3B7D] hover:bg-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Apply Now CTA & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            {/* Primary Action Button */}
            <Link
              href="/admission"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wider uppercase transition-all duration-200 bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap border border-[#FFC700]"
            >
              <span>Apply Now</span>
              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              id="menu-toggle"
              onClick={() => setMobileOpen(true)}
              className={`p-2 focus:outline-none xl:hidden rounded-lg transition-colors ${
                isTransparent
                  ? "text-white hover:bg-white/15"
                  : "text-[#0E3B7D] hover:bg-slate-100"
              }`}
              aria-label="Open navigation menu"
            >
              <span className="material-symbols-outlined text-28px">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Navigation Drawer ────────────────────────────── */}
      <div
        id="mobile-menu-overlay"
        className={`fixed inset-0 z-[110] transition-all duration-300 ${
          mobileOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setMobileOpen(false);
        }}
      >
        {/* Dark Backdrop */}
        <div className="absolute inset-0 bg-[#09234B]/60 backdrop-blur-sm" />

        {/* Drawer Content */}
        <div
          id="mobile-menu"
          className={`absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="p-5 flex justify-between items-center border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white ring-2 ring-[#FFC700]">
                <Image
                  src="/images/mainLogo.png"
                  alt="Hinthar Logo"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm text-[#0E3B7D] tracking-tight">
                  Hinthar School
                </span>
                <span className="text-[10px] font-bold text-[#FFC700] uppercase tracking-wider">
                  Pearson Edexcel Center
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-slate-500 hover:text-[#0E3B7D] p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          {/* Drawer Navigation List */}
          <nav className="flex-1 overflow-y-auto p-5 space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Menu & Portals
            </p>
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between py-3 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all ${
                    isActive
                      ? "bg-[#0E3B7D] text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100 hover:text-[#0E3B7D]"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="material-symbols-outlined text-xs opacity-60">
                    arrow_forward
                  </span>
                </Link>
              );
            })}

            {/* Quick Actions */}
            <div className="pt-6 mt-6 border-t border-slate-200 space-y-2.5">
              <Link
                href="/admission"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] py-3 rounded-xl text-xs font-extrabold tracking-wider uppercase shadow-md active:scale-95 transition-all"
              >
                <span>Apply for Admission</span>
                <span className="material-symbols-outlined text-base font-bold">arrow_forward</span>
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold tracking-wider uppercase border border-slate-200 hover:text-[#0E3B7D] transition-all"
              >
                <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                <span>Staff & Admin Portal</span>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
