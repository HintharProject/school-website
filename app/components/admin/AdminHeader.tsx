"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getAdminNotificationsAction,
  AdminNotificationItem,
} from "@/lib/actions/notifications";

export default function AdminHeader({
  onMenuToggle,
  isDrawerOpen = false,
  theme = "light",
  onThemeToggle,
}: {
  onMenuToggle?: () => void;
  isDrawerOpen?: boolean;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}) {
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [totalPendingCount, setTotalPendingCount] = useState(0);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);

  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notifDropdownOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNotifDropdownOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [notifDropdownOpen]);

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

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 shadow-xs">
      {/* Left: Hamburger + Brand (moved from sidebar) */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label={isDrawerOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isDrawerOpen}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer shrink-0"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-lg">
            {isDrawerOpen ? "close" : "menu"}
          </span>
        </button>

        <Link href="/admin" className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 rounded-full bg-white p-0.5 ring-2 ring-[#FFC700] shadow-sm shrink-0">
            <Image src="/images/mainLogo.png" alt="Hinthar International School logo" fill sizes="40px" className="object-contain" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-black text-sm text-[#09234B] tracking-tight leading-tight truncate">
              Hinthar Portal
            </span>
            <span className="text-[10px] font-bold text-[#0E3B7D]/70 uppercase tracking-wider truncate hidden sm:block">
              International School
            </span>
          </div>
        </Link>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Theme Toggle (admin portal only) */}
        <button
          type="button"
          onClick={onThemeToggle}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={theme === "dark"}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-lg">
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifMenuRef}>
          <button
            type="button"
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
                {totalPendingCount > 99 ? "99+" : totalPendingCount}
              </span>
            ) : null}
          </button>

          {notifDropdownOpen && (
            <div role="dialog" aria-label="Notifications" className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-fade-in max-sm:fixed max-sm:inset-x-3 max-sm:top-24 max-sm:w-auto">
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
                <Link href="/admin/notices" onClick={() => setNotifDropdownOpen(false)} className="font-bold text-[#0E3B7D] hover:underline">
                  Open Noticeboard &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
