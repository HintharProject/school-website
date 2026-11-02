"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  List,
  X,
  ArrowSquareOut,
  Bell,
  ArrowsClockwise,
  IdentificationBadge,
  GraduationCap,
  UsersThree,
  CalendarBlank,
  CheckCircle,
} from "@phosphor-icons/react";
import {
  getAdminNotificationsAction,
  type AdminNotificationItem,
} from "@/lib/actions/notifications";

function NotificationIcon({ type }: { type: AdminNotificationItem["type"] }) {
  switch (type) {
    case "admission":
      return <IdentificationBadge className="w-4 h-4" weight="duotone" />;
    case "yearbook":
      return <GraduationCap className="w-4 h-4" weight="duotone" />;
    case "club":
      return <UsersThree className="w-4 h-4" weight="duotone" />;
    case "activity":
      return <CalendarBlank className="w-4 h-4" weight="duotone" />;
    default:
      return <CheckCircle className="w-4 h-4" weight="duotone" />;
  }
}

export default function AdminHeader({
  onMenuToggle,
  isDrawerOpen = false,
}: {
  onMenuToggle?: () => void;
  isDrawerOpen?: boolean;
}) {
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>(
    []
  );
  const [totalPendingCount, setTotalPendingCount] = useState(0);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notifDropdownOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNotifDropdownOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notifMenuRef.current &&
        !notifMenuRef.current.contains(e.target as Node)
      ) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label={
            isDrawerOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={isDrawerOpen}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer shrink-0"
        >
          {isDrawerOpen ? (
            <X className="w-5 h-5" weight="bold" />
          ) : (
            <List className="w-5 h-5" weight="bold" />
          )}
        </button>

        <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-9 h-9 rounded-full bg-white p-0.5 ring-2 ring-[#FFD600] shrink-0 overflow-hidden">
            <Image
              src="/images/hinthar-logo.webp"
              alt="Hinthar International School"
              fill
              sizes="36px"
              className="object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-sm text-[#193E8A] tracking-tight leading-tight truncate">
              Hinthar International School
            </span>
            <span className="text-[11px] font-semibold text-slate-500 truncate hidden sm:block">
              Website & Admissions Portal
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EEF3FC] hover:bg-[#193E8A] text-[#193E8A] hover:text-white text-xs font-extrabold transition-colors"
        >
          <ArrowSquareOut className="w-4 h-4" weight="bold" />
          <span className="hidden sm:inline">View Live Website</span>
        </Link>

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
            <Bell className="w-5 h-5" weight="duotone" />
            {totalPendingCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white">
                {totalPendingCount > 99 ? "99+" : totalPendingCount}
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <div
              role="dialog"
              aria-label="Notifications"
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-fade-in max-sm:fixed max-sm:inset-x-3 max-sm:top-20 max-sm:w-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-extrabold text-[#1E232B] uppercase tracking-wider">
                    Pending Actions
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Admissions & student contributor drafts
                  </p>
                </div>
                <span
                  className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    totalPendingCount > 0
                      ? "bg-[#FFD600] text-[#162033]"
                      : "bg-[#EEF3FC] text-[#193E8A]"
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
                    className="py-2.5 flex items-start gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#EEF3FC] text-[#193E8A] flex items-center justify-center shrink-0">
                      <NotificationIcon type={n.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-[#1E232B] truncate group-hover:text-[#193E8A]">
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                        {n.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={fetchNotifications}
                  disabled={isLoadingNotifs}
                  className="text-slate-600 hover:text-[#193E8A] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowsClockwise
                    className={`w-3.5 h-3.5 ${isLoadingNotifs ? "animate-spin" : ""}`}
                    weight="bold"
                  />
                  <span>Refresh</span>
                </button>
                <Link
                  href="/admin"
                  onClick={() => setNotifDropdownOpen(false)}
                  className="font-bold text-[#193E8A] hover:underline"
                >
                  Overview Queue →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
