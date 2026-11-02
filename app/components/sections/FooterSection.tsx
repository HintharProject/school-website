"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  EnvelopeSimple,
  FacebookLogo,
  YoutubeLogo,
  TelegramLogo,
  LinkedinLogo,
  Globe,
  ChatCircleDots,
  ArrowUpRight,
  LockKey,
} from "@phosphor-icons/react";
import {
  DEFAULT_BRAND_AND_FOOTER,
  type BrandAndFooterContent,
  type SocialLinkItem,
} from "@/lib/content/defaults";
import { useLocale, useT } from "@/lib/i18n/useT";
import { locField } from "@/lib/i18n/loc";

function SocialIcon({ platform }: { platform: SocialLinkItem["platform"] }) {
  switch (platform) {
    case "facebook":
      return <FacebookLogo className="w-4 h-4" weight="fill" />;
    case "youtube":
      return <YoutubeLogo className="w-4 h-4" weight="fill" />;
    case "telegram":
      return <TelegramLogo className="w-4 h-4" weight="fill" />;
    case "viber":
      return <ChatCircleDots className="w-4 h-4" weight="fill" />;
    case "linkedin":
      return <LinkedinLogo className="w-4 h-4" weight="fill" />;
    default:
      return <Globe className="w-4 h-4" weight="bold" />;
  }
}

export default function FooterSection({
  brand = DEFAULT_BRAND_AND_FOOTER,
}: {
  brand?: BrandAndFooterContent;
}) {
  const locale = useLocale();
  const t = useT();

  const subtitle = locField(locale, brand.subtitleEn, brand.subtitleMy);
  const footerBlurb = locField(locale, brand.footerBlurbEn, brand.footerBlurbMy);
  const addressSummary = locField(
    locale,
    brand.addressSummaryEn,
    brand.addressSummaryMy
  );
  const copyrightText = locField(locale, brand.copyrightEn, brand.copyrightMy);

  return (
    <footer
      id="contact"
      className="bg-[#0F2759] text-white pt-16 pb-10 relative overflow-hidden"
    >
      {/* Top Gold-Cobalt Identity Rule */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#193E8A] via-[#FFD600] to-[#193E8A]" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
        {/* Col 1: Brand Identity */}
        <div className="md:col-span-5 space-y-5">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white ring-2 ring-[#FFD600] p-0.5 shrink-0">
              <Image
                src={brand.logoUrl || "/images/hinthar-logo.webp"}
                alt={brand.schoolName}
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                {brand.schoolName}
              </h4>
              <p className="text-xs font-semibold text-[#FFD600]">{subtitle}</p>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed max-w-md">
            {footerBlurb}
          </p>

          {brand.socialLinks?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {brand.socialLinks.map((social, idx) => (
                <a
                  key={`${social.platform}-${idx}`}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 hover:bg-[#FFD600] text-white hover:text-[#162033] text-xs font-bold transition-colors"
                >
                  <SocialIcon platform={social.platform} />
                  <span>{social.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Col 2: Clean 5-Page Navigation + Pathways */}
        <div className="md:col-span-3 space-y-4">
          <h4 className="text-xs font-extrabold text-[#FFD600] uppercase tracking-wider">
            {t("footer.navigation")}
          </h4>
          <ul className="space-y-2.5 text-sm text-slate-200">
            <li>
              <Link
                href="/"
                className="hover:text-[#FFD600] transition-colors inline-flex items-center gap-1"
              >
                {t("nav.home")}
              </Link>
            </li>
            <li>
              <Link
                href="/#classes"
                className="hover:text-[#FFD600] transition-colors inline-flex items-center gap-1"
              >
                {t("footer.academicPathways")}
              </Link>
            </li>
            <li>
              <Link
                href="/campuses"
                className="hover:text-[#FFD600] transition-colors inline-flex items-center gap-1"
              >
                {t("nav.campuses")}
              </Link>
            </li>
            <li>
              <Link
                href="/yearbook"
                className="hover:text-[#FFD600] transition-colors inline-flex items-center gap-1"
              >
                {t("nav.yearbook")}
              </Link>
            </li>
            <li>
              <Link
                href="/clubs"
                className="hover:text-[#FFD600] transition-colors inline-flex items-center gap-1"
              >
                {t("nav.clubs")}
              </Link>
            </li>
            <li>
              <Link
                href="/admission"
                className="hover:text-[#FFD600] transition-colors inline-flex items-center gap-1 font-semibold text-white"
              >
                {t("nav.admissions")}
                <ArrowUpRight className="w-3.5 h-3.5 text-[#FFD600]" weight="bold" />
              </Link>
            </li>
            <li>
              <Link
                href="/admission?tab=track"
                className="hover:text-[#FFD600] transition-colors inline-flex items-center gap-1 text-slate-300"
              >
                {t("footer.trackApplication")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Admissions & Campuses Contact */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="text-xs font-extrabold text-[#FFD600] uppercase tracking-wider">
            {t("footer.contactAdmissions")}
          </h4>
          <div className="space-y-3.5 text-sm text-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-[#FFD600]" weight="fill" />
              </div>
              <Link
                href="/campuses"
                className="leading-relaxed hover:text-[#FFD600] transition-colors"
              >
                {addressSummary}
              </Link>
            </div>

            {brand.primaryPhone && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-[#FFD600]" weight="fill" />
                </div>
                <div className="space-y-0.5">
                  <a
                    href={`tel:${brand.primaryPhone.replace(/\s+/g, "")}`}
                    className="block hover:text-[#FFD600] transition-colors font-medium"
                  >
                    {brand.primaryPhone}
                  </a>
                  {brand.secondaryPhone && (
                    <a
                      href={`tel:${brand.secondaryPhone.replace(/\s+/g, "")}`}
                      className="block text-xs text-slate-300 hover:text-[#FFD600] transition-colors"
                    >
                      {brand.secondaryPhone}
                    </a>
                  )}
                </div>
              </div>
            )}

            {brand.admissionsEmail && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <EnvelopeSimple className="w-4 h-4 text-[#FFD600]" weight="fill" />
                </div>
                <a
                  href={`mailto:${brand.admissionsEmail}`}
                  className="hover:text-[#FFD600] transition-colors break-all"
                >
                  {brand.admissionsEmail}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Admin/Contributor Portal Link */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>
          © {new Date().getFullYear()} {brand.schoolName}. {copyrightText}
        </p>
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#FFD600] transition-colors"
        >
          <LockKey className="w-3.5 h-3.5" weight="bold" />
          <span>{t("footer.portalLogin")}</span>
        </Link>
      </div>
    </footer>
  );
}
