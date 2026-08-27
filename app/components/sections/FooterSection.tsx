"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getSiteContentMap,
  type ContactInfoItem,
} from "@/lib/actions/siteContent";
import { DEFAULT_CONTACT_INFO } from "@/lib/content/defaults";
import { useT } from "@/lib/i18n/useT";
import { subscribeNewsletterAction } from "@/lib/actions/newsletter";
import type { TranslateKey } from "@/lib/i18n";

const quickLinks: { labelKey: TranslateKey; href: string }[] = [
  { labelKey: "nav.home", href: "/" },
  { labelKey: "nav.campuses", href: "/campuses" },
  { labelKey: "nav.about", href: "/#about" },
  { labelKey: "nav.classes", href: "/classes" },
  { labelKey: "nav.admission", href: "/admission" },
  { labelKey: "nav.clubs", href: "/clubs" },
  { labelKey: "nav.yearbook", href: "/yearbook" },
  { labelKey: "nav.news", href: "/news" },
  { labelKey: "nav.staff", href: "/staff" },
  { labelKey: "footer.aiConsultation", href: "/chatbot" },
];

const programs: { labelKey: TranslateKey; fallback: string; href: string }[] = [
  { labelKey: "nav.classes", fallback: "Lower Secondary (Year 7–9)", href: "/classes" },
  { labelKey: "nav.classes", fallback: "Pearson Edexcel IGCSE (Year 10–11)", href: "/classes" },
  { labelKey: "nav.classes", fallback: "Pearson Edexcel IAL (Year 12–13)", href: "/classes" },
  { labelKey: "nav.yearbook", fallback: "University Entrance & Placements", href: "/yearbook" },
];

function NewsletterSignup() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setMessage(null);

    try {
      const result = await subscribeNewsletterAction({ email, source: "footer" });
      if (result.success) {
        setState("done");
        setMessage(result.message || "Subscribed!");
        setEmail("");
      } else {
        setState("error");
        setMessage(result.error || "Subscription failed. Please try again.");
      }
    } catch {
      setState("error");
      setMessage("Subscription failed. Please try again.");
    }
  };

  return (
    <div className="pt-2 space-y-2">
      <h5 className="text-[11px] font-black text-[#FFC700] uppercase tracking-[0.18em]">
        {t("footer.newsletterTitle")}
      </h5>
      <p className="text-[11px] text-slate-400 font-light leading-relaxed">
        {t("footer.newsletterSubtitle")}
      </p>
      <form onSubmit={handleSubscribe} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("footer.emailPlaceholder")}
          className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-xs text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#FFC700]/60 transition-all"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="px-3.5 py-2 rounded-lg bg-[#FFC700] hover:bg-[#E6B300] text-[#09234B] text-[10px] font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all disabled:opacity-60 cursor-pointer whitespace-nowrap"
        >
          {state === "loading" ? t("footer.subscribing") : t("footer.subscribe")}
        </button>
      </form>
      {message && (
        <p
          role="status"
          className={`text-[11px] font-semibold ${state === "error" ? "text-red-300" : "text-emerald-300"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default function FooterSection() {
  const t = useT();
  const [contactItems, setContactItems] = useState<ContactInfoItem[]>(DEFAULT_CONTACT_INFO);

  useEffect(() => {
    let cancelled = false;
    getSiteContentMap()
      .then((map) => {
        if (!cancelled && map.contactInfo?.length) {
          setContactItems(map.contactInfo);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer
      id="contact"
      className="bg-[#09234B] text-white pt-[80px] pb-[40px] md:pt-[100px] scroll-mt-20 relative overflow-hidden"
    >
      {/* Decorative gradient top border */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0E3B7D] via-[#FFC700] to-[#0E3B7D]" />

      <div className="max-w-[1280px] mx-auto px-6 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
        {/* Brand column */}
        <div className="space-y-5 lg:pr-6">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white ring-2 ring-[#FFC700] p-0.5">
              <Image
                src="/images/mainLogo.png"
                alt="Hinthar International School Logo"
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h4 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">
                Hinthar International
              </h4>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFC700]">
                Pearson Edexcel Center
              </span>
            </div>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
            Delivering world-class Pearson Edexcel qualifications from Lower Secondary (Year 7–9) to International A-Level in Yangon, Myanmar.
          </p>
          <NewsletterSignup />
          <div className="flex gap-2.5 pt-1">
            {[
              { icon: "public", label: "Official Site", href: "https://hinthar.education/" },
              { icon: "mail", label: "Email Admissions", href: "mailto:info@hinthar.education" },
              { icon: "call", label: "Phone Hotline", href: "tel:+959894332200" },
            ].map((social) => (
              <a
                key={social.icon}
                href={social.href}
                target={social.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                aria-label={social.label}
                className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center hover:bg-[#FFC700] hover:text-[#09234B] hover:border-[#FFC700] hover:-translate-y-1 transition-all duration-200"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[18px]">{social.icon}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-[#FFC700] uppercase tracking-[0.18em]">
            {t("footer.quickLinks")}
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm font-light text-slate-300">
            {quickLinks.map((link) => (
              <li key={link.href + link.labelKey}>
                <Link
                  href={link.href}
                  className="hover:text-[#FFC700] hover:translate-x-1 inline-block transition-all"
                >
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Programs */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-[#FFC700] uppercase tracking-[0.18em]">
            {t("footer.curriculumsPortals")}
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm font-light text-slate-300">
            {programs.map((prog, i) => (
              <li key={`${prog.labelKey}-${i}`}>
                <Link
                  href={prog.href}
                  className="hover:text-[#FFC700] hover:translate-x-1 inline-block transition-all"
                >
                  {prog.fallback}
                </Link>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-white/10 space-y-2.5">
            <Link
              href="/portal"
              className="hover:text-[#FFC700] inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:translate-x-1 transition-all"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-xs text-[#FFC700]">manage_accounts</span>
              <span>{t("footer.studentPortalLink")}</span>
            </Link>
            <br />
            <Link
              href="/admin/login"
              className="hover:text-[#FFC700] inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:translate-x-1 transition-all"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-xs text-[#FFC700]">admin_panel_settings</span>
              <span>{t("footer.staffPortalLink")}</span>
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-[#FFC700] uppercase tracking-[0.18em]">
            {t("footer.campusLocation")}
          </h4>
          <div className="space-y-4 text-xs sm:text-sm font-light text-slate-300">
            {contactItems.map((item) => (
              <div key={item.icon + item.text} className="flex gap-3.5 group">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#FFC700] group-hover:text-[#09234B] transition-colors">
                  <span aria-hidden="true" className="material-symbols-outlined text-white text-[18px] group-hover:text-[#09234B] transition-colors">
                    {item.icon}
                  </span>
                </div>
                {item.href ? (
                  <a href={item.href} className="self-center hover:text-[#FFC700] transition-colors leading-relaxed">
                    {item.text}
                  </a>
                ) : (
                  <p className="self-center leading-relaxed">{item.text}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-8 mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-light text-slate-400">
        <p>© {new Date().getFullYear()} Hinthar International School. Pearson Edexcel Examination Center, Yangon. {t("footer.rights")}</p>
        <div className="flex gap-6">
          <span className="text-slate-400">Academic Excellence &amp; Character</span>
        </div>
      </div>
    </footer>
  );
}
