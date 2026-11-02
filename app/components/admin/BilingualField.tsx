"use client";

import { Translate } from "@phosphor-icons/react";

interface BilingualFieldProps {
  label: string;
  enValue: string;
  myValue: string;
  onEnChange: (val: string) => void;
  onMyChange: (val: string) => void;
  multiline?: boolean;
  rows?: number;
  requiredEn?: boolean;
  placeholderEn?: string;
  placeholderMy?: string;
  helperText?: string;
}

export default function BilingualField({
  label,
  enValue,
  myValue,
  onEnChange,
  onMyChange,
  multiline = false,
  rows = 3,
  requiredEn = false,
  placeholderEn = "English text...",
  placeholderMy = "မြန်မာဘာသာဖြင့် ရေးသားရန် (Keep Hinthar International School, Pearson Edexcel, IGCSE, IAL in English)...",
  helperText,
}: BilingualFieldProps) {
  const needsBurmese = !myValue || !myValue.trim();

  return (
    <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-extrabold text-[#1E232B] flex items-center gap-1.5">
          <Translate className="w-4 h-4 text-[#193E8A]" weight="bold" />
          <span>{label}</span>
          {requiredEn && <span className="text-red-500">*</span>}
        </span>

        {needsBurmese ? (
          <span className="inline-flex items-center rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-900">
            Needs Burmese
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
            EN + MY Ready
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* English Column */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            English (EN)
          </label>
          {multiline ? (
            <textarea
              rows={rows}
              required={requiredEn}
              value={enValue}
              onChange={(e) => onEnChange(e.target.value)}
              placeholder={placeholderEn}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
            />
          ) : (
            <input
              type="text"
              required={requiredEn}
              value={enValue}
              onChange={(e) => onEnChange(e.target.value)}
              placeholder={placeholderEn}
              className="w-full min-h-10 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
            />
          )}
        </div>

        {/* Myanmar Column */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">
            မြန်မာ (MY — falls back to EN if blank)
          </label>
          {multiline ? (
            <textarea
              rows={rows}
              value={myValue}
              onChange={(e) => onMyChange(e.target.value)}
              placeholder={placeholderMy}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-[#1E232B] leading-relaxed focus:border-[#193E8A] outline-none"
            />
          ) : (
            <input
              type="text"
              value={myValue}
              onChange={(e) => onMyChange(e.target.value)}
              placeholder={placeholderMy}
              className="w-full min-h-10 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-[#1E232B] focus:border-[#193E8A] outline-none"
            />
          )}
        </div>
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      )}
    </div>
  );
}

