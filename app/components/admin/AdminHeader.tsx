"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FALLBACK_GUEST_USER, UserProfile, mapUserProfileRecord } from "../../admin/adminStore";
import { authClient } from "@/lib/auth/auth-client";

export default function AdminHeader() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<UserProfile>(FALLBACK_GUEST_USER);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      setActiveRole(mapUserProfileRecord(session.user));
    }
  }, [session]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setUserDropdownOpen(false);
    try {
      await authClient.signOut();
    } catch (err) {
      console.warn("Sign out error:", err);
    }
    router.push("/admin/login");
    router.refresh();
  };

  const isAdmin = activeRole?.role === "admin";

  const notifications = [
    {
      id: 1,
      title: "New Admission Application",
      desc: "Aung Kaung Myat applied for Pearson IAL (Year 12)",
      time: "15m ago",
      icon: "assignment_ind",
      unread: true,
      href: "/admin/admissions",
    },
    {
      id: 2,
      title: "Yearbook Entry Submitted",
      desc: "Lin Myat Thu submitted Class of 2026 profile for review",
      time: "1h ago",
      icon: "auto_stories",
      unread: true,
      href: "/admin/yearbook",
    },
    {
      id: 3,
      title: "Pearson Edexcel Examination Series",
      desc: "Registration portal opened for Oct/Nov examination series",
      time: "3h ago",
      icon: "campaign",
      unread: false,
      href: "/admin/classes",
    },
  ];

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-30 shadow-xs">
      {/* Search Area */}
      <div className="flex items-center gap-3">
        <div className="relative w-64 sm:w-80 hidden md:block">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search student, class, notice..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
          />
        </div>
      </div>

      {/* Right Controls: Live Site, Notifications, User Account Popover */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Visit Live Website Button */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8F0FE] hover:bg-[#0E3B7D] text-[#0E3B7D] hover:text-white text-[11px] font-black transition-all"
        >
          <span className="material-symbols-outlined text-sm">open_in_new</span>
          <span className="hidden sm:inline">View Live Site</span>
        </Link>

        {/* Notifications Popover */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors relative border border-slate-200"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-lg">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-black text-[#09234B] uppercase tracking-wider">
                    School Notifications
                  </h4>
                  <p className="text-[11px] text-slate-400">Admissions, yearbook submissions &amp; notices</p>
                </div>
                <span className="text-[10px] font-bold bg-[#E8F0FE] text-[#0E3B7D] px-2 py-0.5 rounded-md">
                  2 Pending
                </span>
              </div>

              <div className="divide-y divide-slate-100 my-2">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setNotifDropdownOpen(false)}
                    className="py-2.5 flex items-start gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors block"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#E8F0FE] text-[#0E3B7D] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-sm">{n.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-[#09234B] truncate">{n.title}</p>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight mt-0.5">
                        {n.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  href="/admin/admissions"
                  onClick={() => setNotifDropdownOpen(false)}
                  className="text-xs font-bold text-[#0E3B7D] hover:underline"
                >
                  View All Admissions Workflow
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Account Popover */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-xs ${activeRole?.badgeColor || "bg-[#FFC700] text-[#09234B]"}`}
            >
              {activeRole?.initials || "TY"}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-black text-[#09234B] leading-none">{activeRole?.fullName || "Administrator"}</p>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-none mt-1 truncate max-w-[140px]">
                {activeRole?.roleLabel || "Administrator"}
              </p>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-base">expand_more</span>
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 space-y-3">
              {/* Account Info Header */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${activeRole?.badgeColor || "bg-[#FFC700] text-[#09234B]"}`}
                >
                  {activeRole?.initials || "TY"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-[#09234B] truncate">{activeRole?.fullName || "Administrator"}</p>
                  <p className="text-[10px] text-slate-500 truncate">{activeRole?.email || "admin@hinthar.education"}</p>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#FFC700] text-[#09234B]">
                    {activeRole?.roleLabel || "Administrator"}
                  </span>
                </div>
              </div>

              {/* Action Links */}
              <div className="space-y-1 text-xs font-bold text-slate-700">
                {isAdmin && (
                  <Link
                    href="/admin/users"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-[#0E3B7D] transition-colors"
                  >
                    <span className="material-symbols-outlined text-base text-[#0E3B7D]">manage_accounts</span>
                    <span>Manage User Accounts</span>
                  </Link>
                )}

                <Link
                  href={isAdmin ? "/admin/admissions" : "/admin/yearbook"}
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-[#0E3B7D] transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-[#0E3B7D]">
                    {isAdmin ? "school" : "auto_stories"}
                  </span>
                  <span>{isAdmin ? "Admissions Pipeline" : "Yearbook Submissions"}</span>
                </Link>

                <Link
                  href="/admin/update-password"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-[#0E3B7D] transition-colors"
                >
                  <span className="material-symbols-outlined text-base text-[#0E3B7D]">
                    lock_reset
                  </span>
                  <span>Change Password</span>
                </Link>
              </div>

              {/* Sign Out Action */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all text-xs font-bold uppercase tracking-wider disabled:opacity-60 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
