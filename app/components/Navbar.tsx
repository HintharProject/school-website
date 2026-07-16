"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Specialisations", href: "#specialisations" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Header shrink on scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll spy
  useEffect(() => {
    const sections = document.querySelectorAll("section[id], footer[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const scrollToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offset = window.innerWidth < 768 ? 64 : 80;
          const top =
            target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: "smooth" });
        }
        setMobileOpen(false);
      }
    },
    []
  );

  return (
    <>
      {/* ── Top Nav Bar ─────────────────────────────────────────── */}
      <header
        id="main-header"
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
          isScrolled 
            ? "py-2 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20" 
            : "py-4 md:py-6 bg-transparent"
        }`}
      >
        <div className={`flex justify-between items-center w-full px-4 md:px-8 mx-auto transition-all duration-500 ${
          isScrolled ? "max-w-[1200px]" : "max-w-[1280px]"
        }`}>
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-4 group cursor-pointer">
            <div className="relative h-10 md:h-12 w-10 md:w-12 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="Hinthar Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className={`hidden sm:block font-extrabold text-lg md:text-xl tracking-tight transition-colors duration-300 ${isScrolled ? 'text-primary' : 'text-white text-shadow-md'}`}>
              Hinthar International School
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className={`hidden lg:flex items-center gap-1 p-1 rounded-full transition-all duration-300 ${
            isScrolled ? 'bg-transparent' : 'bg-white/10 backdrop-blur-md border border-white/20'
          }`}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`px-4 py-2 rounded-full text-sm font-bold tracking-wider uppercase transition-all duration-300 flex items-center whitespace-nowrap ${
                  activeSection === link.href.slice(1) 
                    ? (isScrolled ? "bg-primary/10 text-primary" : "bg-white/20 text-white") 
                    : (isScrolled ? "text-on-surface-variant hover:text-primary hover:bg-black/5" : "text-white/80 hover:text-white hover:bg-white/10")
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-4">
            <Link
              href="/admission"
              className={`hidden sm:block px-6 py-2.5 rounded-full text-sm font-bold tracking-wider uppercase transition-all duration-300 shadow-md active:scale-95 whitespace-nowrap ${
                isScrolled 
                  ? "bg-academic-gold text-oxford-blue hover:bg-primary hover:text-white" 
                  : "bg-white text-primary hover:bg-academic-gold hover:text-oxford-blue"
              }`}
            >
              Apply Now
            </Link>
            <button
              id="menu-toggle"
              onClick={() => setMobileOpen(true)}
              className={`p-2 focus:outline-none lg:hidden rounded-full transition-colors ${
                isScrolled ? 'text-primary hover:bg-black/5' : 'text-white hover:bg-white/10'
              }`}
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-3xl">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ────────────────────────────────────────── */}
      <div
        id="mobile-menu-overlay"
        className={`fixed inset-0 z-[110] transition-all duration-500 ${
          mobileOpen ? "visible" : "invisible"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setMobileOpen(false);
        }}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-oxford-blue/40 backdrop-blur-sm transition-opacity duration-500 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Drawer panel */}
        <div
          id="mobile-menu"
          className={`absolute top-0 right-0 h-full w-4/5 max-w-sm bg-surface shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 flex justify-between items-center border-b border-outline-variant/50">
            <span className="font-bold text-xl text-primary tracking-tight">
              Menu
            </span>
            <button
              id="menu-close"
              onClick={() => setMobileOpen(false)}
              className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-black/5"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-6 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className={`block text-lg py-3 px-4 rounded-xl tracking-widest uppercase font-bold transition-all ${
                  activeSection === link.href.slice(1) 
                    ? "bg-primary/10 text-primary" 
                    : "text-on-surface-variant hover:bg-black/5 hover:text-primary"
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-8 mt-4 border-t border-outline-variant/50">
              <Link
                href="/admission"
                onClick={() => setMobileOpen(false)}
                className="block w-full bg-primary text-white py-4 rounded-xl text-sm font-bold tracking-wider uppercase text-center hover:bg-primary-container transition-all shadow-md active:scale-95"
              >
                Apply Now
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
