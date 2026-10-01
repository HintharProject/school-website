"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { mapUserProfileRecord, FALLBACK_GUEST_USER } from "../adminStore";
import StaffTab from "./StaffTab";
import YearbookTab from "./YearbookTab";

export default function AdminPeoplePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const currentUser = session?.user ? mapUserProfileRecord(session.user) : FALLBACK_GUEST_USER;
  const isAdmin = currentUser.role === "admin";

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"staff" | "yearbook">(() => {
    if (!isAdmin) return "yearbook";
    return tabParam === "yearbook" ? "yearbook" : "staff";
  });

  useEffect(() => {
    if (!isAdmin) {
      setActiveTab("yearbook");
      return;
    }
    if (tabParam === "staff" || tabParam === "yearbook") {
      setActiveTab(tabParam);
    }
  }, [tabParam, isAdmin]);

  const switchTab = (tab: "staff" | "yearbook") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`/admin/people?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0E3B7D] text-[11px] font-bold uppercase tracking-wider mb-2">
            <span aria-hidden="true" className="material-symbols-outlined text-sm">groups</span>
            <span>People &amp; Community Management</span>
          </div>
          <h1 className="text-2xl font-black text-[#09234B] tracking-tight">People &amp; Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated directory for Faculty &amp; Staff profiles and Alumni Yearbook regional batches.
          </p>
        </div>

        {/* Tab Switcher (Admins see both, Students see Yearbook) */}
        {isAdmin && (
          <div className="inline-flex p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
            <button
              type="button"
              onClick={() => switchTab("staff")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "staff"
                  ? "bg-[#0E3B7D] text-white shadow-xs font-black"
                  : "text-slate-600 hover:text-[#0E3B7D] hover:bg-slate-50"
              }`}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">badge</span>
              <span>Faculty &amp; Staff</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab("yearbook")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "yearbook"
                  ? "bg-[#0E3B7D] text-white shadow-xs font-black"
                  : "text-slate-600 hover:text-[#0E3B7D] hover:bg-slate-50"
              }`}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">auto_stories</span>
              <span>Alumni Yearbook</span>
            </button>
          </div>
        )}
      </div>

      {/* Render Active Tab */}
      {isAdmin && activeTab === "staff" ? (
        <StaffTab />
      ) : (
        <YearbookTab />
      )}
    </div>
  );
}
