import Image from "next/image";
import Link from "next/link";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/#about" },
  { label: "Classes & Syllabi", href: "/classes" },
  { label: "Admissions", href: "/admission" },
  { label: "Clubs & Life", href: "/clubs" },
  { label: "Yearbook & Honors", href: "/yearbook" },
  { label: "AI Consultation", href: "/chatbot" },
];

const programs = [
  { label: "Lower Secondary (Year 7–9)", href: "/classes" },
  { label: "Pearson Edexcel IGCSE (Year 10–11)", href: "/classes" },
  { label: "Pearson Edexcel IAL (Year 12–13)", href: "/classes" },
  { label: "University Entrance & Placements", href: "/yearbook" },
];

const contactInfo = [
  {
    icon: "location_on",
    text: "No. 23B, Ywar Ma Kyaung Lane, Hlaing Township, Yangon, Myanmar, 11051",
  },
  { icon: "mail", text: "info@hinthar.education", href: "mailto:info@hinthar.education" },
  { icon: "call", text: "+95 9 894 332200", href: "tel:+959894332200" },
];

export default function FooterSection() {
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
                <span className="material-symbols-outlined text-[18px]">{social.icon}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-[#FFC700] uppercase tracking-[0.18em]">
            Navigation
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm font-light text-slate-300">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="hover:text-[#FFC700] hover:translate-x-1 inline-block transition-all"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Programs */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-[#FFC700] uppercase tracking-[0.18em]">
            Curriculums &amp; Portals
          </h4>
          <ul className="space-y-2.5 text-xs sm:text-sm font-light text-slate-300">
            {programs.map((prog) => (
              <li key={prog.label}>
                <Link
                  href={prog.href}
                  className="hover:text-[#FFC700] hover:translate-x-1 inline-block transition-all"
                >
                  {prog.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-white/10">
            <Link
              href="/admin/login"
              className="hover:text-[#FFC700] inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:translate-x-1 transition-all"
            >
              <span className="material-symbols-outlined text-xs text-[#FFC700]">admin_panel_settings</span>
              <span>Staff / Faculty Portal</span>
            </Link>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-[#FFC700] uppercase tracking-[0.18em]">
            Campus Location
          </h4>
          <div className="space-y-4 text-xs sm:text-sm font-light text-slate-300">
            {contactInfo.map((item) => (
              <div key={item.icon} className="flex gap-3.5 group">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#FFC700] group-hover:text-[#09234B] transition-colors">
                  <span className="material-symbols-outlined text-white text-[18px] group-hover:text-[#09234B] transition-colors">
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
        <p>© {new Date().getFullYear()} Hinthar International School. Pearson Edexcel Examination Center, Yangon.</p>
        <div className="flex gap-6">
          <span className="text-slate-400">Academic Excellence &amp; Character</span>
        </div>
      </div>
    </footer>
  );
}
