"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "../components/ThemeProvider";

export default function InnerNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-[100] bg-surface/90 dark:bg-surface-variant/90 backdrop-blur-md shadow-sm border-b border-outline-variant/30">
        <div className="flex justify-between items-center w-full px-4 md:px-8 mx-auto max-w-[1280px] h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="relative h-8 md:h-10 w-8 md:w-10">
              <Image src="/images/logo.png" alt="Hinthar Logo" fill className="object-contain" />
            </div>
            <span className="hidden sm:block font-extrabold text-base md:text-lg text-primary dark:text-primary-fixed tracking-tight group-hover:opacity-80 transition-opacity">
              Hinthar Education
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/" className="text-sm font-bold text-on-surface-variant hover:text-primary dark:text-on-surface dark:hover:text-primary-fixed uppercase tracking-wider transition-colors">Home</Link>
            <Link href="/yearbook" className="text-sm font-bold text-on-surface-variant hover:text-primary dark:text-on-surface dark:hover:text-primary-fixed uppercase tracking-wider transition-colors">Yearbook</Link>
            <Link href="/classes" className="text-sm font-bold text-on-surface-variant hover:text-primary dark:text-on-surface dark:hover:text-primary-fixed uppercase tracking-wider transition-colors">Classes</Link>
            <Link href="/clubs" className="text-sm font-bold text-on-surface-variant hover:text-primary dark:text-on-surface dark:hover:text-primary-fixed uppercase tracking-wider transition-colors">Clubs</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-full text-on-surface-variant hover:bg-black/5 dark:text-on-surface dark:hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined">{theme === "dark" ? "light_mode" : "dark_mode"}</span>
            </button>
            <Link href="/admission" className="hidden sm:block px-5 py-2 bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue rounded-full text-xs font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-transform">
              Apply Now
            </Link>
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-on-surface-variant">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-[110] transition-all duration-300 ${mobileOpen ? "visible" : "invisible"}`} onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false); }}>
        <div className={`absolute inset-0 bg-oxford-blue/40 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`} />
        <div className={`absolute top-0 right-0 h-full w-4/5 max-w-sm bg-surface shadow-2xl flex flex-col transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="p-6 flex justify-between items-center border-b border-outline-variant/30">
            <span className="font-bold text-lg text-primary tracking-tight">Menu</span>
            <button onClick={() => setMobileOpen(false)} className="text-on-surface-variant p-2 rounded-full hover:bg-black/5">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-6 space-y-4">
            <Link href="/" className="block text-lg font-bold text-on-surface-variant hover:text-primary uppercase" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/yearbook" className="block text-lg font-bold text-on-surface-variant hover:text-primary uppercase" onClick={() => setMobileOpen(false)}>Yearbook</Link>
            <Link href="/classes" className="block text-lg font-bold text-on-surface-variant hover:text-primary uppercase" onClick={() => setMobileOpen(false)}>Classes</Link>
            <Link href="/clubs" className="block text-lg font-bold text-on-surface-variant hover:text-primary uppercase" onClick={() => setMobileOpen(false)}>Clubs</Link>
            <div className="pt-6 border-t border-outline-variant/30 mt-6">
              <Link href="/admission" className="block w-full text-center bg-primary text-white py-3 rounded-xl font-bold uppercase tracking-wider shadow-md" onClick={() => setMobileOpen(false)}>Apply Now</Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
