"use client";

import Image from "next/image";
import { useState } from "react";
import { useT } from "@/lib/i18n/useT";
import type { PublicStaffMember } from "@/lib/actions/staff";
import { isR2AssetUrl } from "@/lib/utils/r2Image";

const DEPARTMENT_ICONS: Record<string, string> = {
  Leadership: "workspace_premium",
  STEM: "science",
  Languages: "translate",
  Arts: "palette",
  Sports: "sports_tennis",
  Administration: "admin_panel_settings",
  General: "school",
};

const DEFAULT_AVATARS = ["/images/Dr_KMH.png", "/images/g4.jpg", "/images/g6.jpg", "/images/g5.jpg"];

export default function StaffView({ staff }: { staff: PublicStaffMember[] }) {
  const t = useT();
  const [selected, setSelected] = useState<PublicStaffMember | null>(null);

  return (
    <>
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-[#E8F0FE] px-4 py-1.5 rounded-full mb-4 border border-[#0E3B7D]/20">
          <span aria-hidden="true" className="material-symbols-outlined text-[#0E3B7D] text-sm font-bold">groups</span>
          <span className="text-xs font-extrabold text-[#0E3B7D] uppercase tracking-wider">Faculty & Mentors</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-[#09234B] mb-3 tracking-tight">
          {t("staff.pageTitle")}
        </h1>
        <p className="text-sm md:text-base text-slate-600 font-normal max-w-lg mx-auto">
          {t("staff.pageSubtitle")}
        </p>
      </div>

      {staff.length === 0 ? (
        <div className="text-center py-20">
          <span aria-hidden="true" className="material-symbols-outlined text-5xl text-slate-300 mb-3">person_off</span>
          <p className="text-sm text-slate-500 font-medium">{t("staff.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {staff.map((member, idx) => (
            <button
              key={member.id}
              type="button"
              onClick={() => setSelected(member)}
              className="group text-left bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-56 bg-slate-100 overflow-hidden">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    unoptimized={isR2AssetUrl(member.image)}
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, 300px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0E3B7D]/90 to-[#164E9A] flex items-center justify-center">
                    <span aria-hidden="true" className="material-symbols-outlined text-white/80 text-6xl">
                      {DEPARTMENT_ICONS[member.department] || "person"}
                    </span>
                  </div>
                )}
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[9px] font-black uppercase tracking-wider text-[#0E3B7D] border border-[#0E3B7D]/10">
                  {member.department}
                </span>
              </div>
              <div className="p-4 space-y-1">
                <h2 className="text-sm font-black text-[#09234B] leading-snug">{member.name}</h2>
                <p className="text-[11px] font-bold text-[#0E3B7D] uppercase tracking-wider">{member.role}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#09234B]/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 text-slate-500 hover:text-[#0E3B7D] shadow-sm"
              aria-label="Close"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-xl">close</span>
            </button>
            <div className="h-52 bg-gradient-to-br from-[#0E3B7D] to-[#164E9A] relative">
              {selected.image ? (
                <Image
                  src={selected.image}
                  alt={selected.name}
                  fill
                  unoptimized={isR2AssetUrl(selected.image)}
                  className="object-cover object-top"
                  sizes="520px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span aria-hidden="true" className="material-symbols-outlined text-white/80 text-7xl">person</span>
                </div>
              )}
            </div>
            <div className="p-6 space-y-3">
              <div>
                <h3 className="text-lg font-black text-[#09234B] tracking-tight">{selected.name}</h3>
                <p className="text-xs font-bold text-[#0E3B7D] uppercase tracking-wider">{selected.role}</p>
              </div>
              {selected.qualifications && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {t("staff.qualifications")}
                  </p>
                  <p className="text-xs text-slate-700 font-medium">{selected.qualifications}</p>
                </div>
              )}
              {selected.bio && <p className="text-xs text-slate-600 font-light leading-relaxed">{selected.bio}</p>}
              <div className="flex flex-wrap gap-2 pt-1">
                {selected.email && (
                  <a
                    href={`mailto:${selected.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8F0FE] text-[#0E3B7D] text-[11px] font-bold hover:bg-[#d8e6fb] transition-colors"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-sm">mail</span>
                    {selected.email}
                  </a>
                )}
                {selected.phone && (
                  <a
                    href={`tel:${selected.phone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold hover:bg-slate-200 transition-colors"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-sm">call</span>
                    {selected.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
