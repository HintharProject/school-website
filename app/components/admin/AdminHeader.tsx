"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FALLBACK_GUEST_USER, UserProfile, mapUserProfileRecord } from "../../admin/adminStore";
import { authClient } from "@/lib/auth/auth-client";
import {
  getAdminNotificationsAction,
  AdminNotificationItem,
} from "@/lib/actions/notifications";

export default function AdminHeader({
  onMenuToggle,
  isDrawerOpen = false,
}: {
  onMenuToggle?: () => void;
  isDrawerOpen?: boolean;
}) {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<UserProfile>(FALLBACK_GUEST_USER);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [totalPendingCount, setTotalPendingCount] = useState(0);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      setActiveRole(mapUserProfileRecord(session.user));
    }
  }, [session]);

  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifs(true);
      const res = await getAdminNotificationsAction();
      setNotifications(res.notifications);
      setTotalPendingCount(res.totalPendingCount);
    } catch (err) {
      console.warn("Fetch notifications note:", err);
    } finally {
      setIsLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserDropdownOpen(false);
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
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

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-xs">
      {/* Left Controls: Mobile Menu + Brand */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label={isDrawerOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isDrawerOpen}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200 lg:hidden cursor-pointer"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-lg">
            {isDrawerOpen ? "close" : "menu"}
          </span>
        </button>
        <span className="font-black text-sm text-[#09234B] tracking-tight lg:hidden">
          Hinthar Portal
        </span>
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
          <span aria-hidden="true" className="material-symbols-outlined text-sm">open_in_new</span>
          <span className="hidden sm:inline">View Live Site</span>
        </Link>

        {/* Notifications Popover */}
        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => {
              const next = !notifDropdownOpen;
              setNotifDropdownOpen(next);
              if (next) fetchNotifications();
            }}
            aria-label="Notifications"
            aria-expanded={notifDropdownOpen}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors relative border border-slate-200 cursor-pointer"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-lg">notifications</span>
            {totalPendingCount > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white font-black text-[10px] rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {totalPendingCount}
              </span>
            ) : null}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-black text-[#09234B] uppercase tracking-wider">
                    School Notifications
                  </h4>
                  <p className="text-[11px] text-slate-400">Admissions, yearbook submissions &amp; proposals</p>
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                    totalPendingCount > 0
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-[#E8F0FE] text-[#0E3B7D]"
                  }`}
                >
                  {totalPendingCount} Pending
                </span>
              </div>

              <div className="divide-y divide-slate-100 my-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setNotifDropdownOpen(false)}
                    className="py-2.5 flex items-start gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors block group"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        n.type === "admission"
                          ? "bg-blue-100 text-[#0E3B7D]"
                          : n.type === "yearbook"
                          ? "bg-amber-100 text-amber-800"
                          : n.type === "club"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-sm">{n.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-[#09234B] truncate group-hover:text-[#0E3B7D]">
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight mt-0.5">
                        {n.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={fetchNotifications}
                  disabled={isLoadingNotifs}
                  className="text-slate-500 hover:text-slate-800 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span aria-hidden="true" className={`material-symbols-outlined text-xs ${isLoadingNotifs ? "animate-spin" : ""}`}>
                    refresh
                  </span>
                  <span>Refresh</span>
                </button>
                <Link
                  href={isAdmin ? "/admin/admissions" : "/admin/yearbook"}
                  onClick={() => setNotifDropdownOpen(false)}
                  className="font-bold text-[#0E3B7D] hover:underline"
                >
                  {isAdmin ? "View All Admissions" : "View All Submissions"} &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Account Popover */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            aria-expanded={userDropdownOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left cursor-pointer"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-xs ${activeRole?.badgeColor || "bg-[#FFC700] text-[#09234B]"}`}
            >
              {activeRole?.initials || (activeRole?.fullName || "U").charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-black text-[#09234B] leading-none">{activeRole?.fullName || "Administrator"}</p>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-none mt-1 truncate max-w-[140px]">
                {activeRole?.roleLabel || "Administrator"}
              </p>
            </div>
            <span aria-hidden="true" className="material-symbols-outlined text-slate-400 text-base">expand_more</span>
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 space-y-3">
              {/* Account Info Header */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${activeRole?.badgeColor || "bg-[#FFC700] text-[#09234B]"}`}
                >
                  {activeRole?.initials || (activeRole?.fullName || "U").charAt(0).toUpperCase()}
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
                    <span aria-hidden="true" className="material-symbols-outlined text-base text-[#0E3B7D]">manage_accounts</span>
                    <span>Manage User Accounts</span>
                  </Link>
                )}

                <Link
                  href={isAdmin ? "/admin/admissions" : "/admin/yearbook"}
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-[#0E3B7D] transition-colors"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-base text-[#0E3B7D]">
                    {isAdmin ? "school" : "auto_stories"}
                  </span>
                  <span>{isAdmin ? "Admissions Pipeline" : "Yearbook Submissions"}</span>
                </Link>

                <Link
                  href="/admin/update-password"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-[#0E3B7D] transition-colors"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-base text-[#0E3B7D]">
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
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">logout</span>
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
