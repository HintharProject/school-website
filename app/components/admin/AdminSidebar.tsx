"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { UserProfile, FALLBACK_GUEST_USER, mapUserProfileRecord } from "../../admin/adminStore";
import { authClient } from "@/lib/auth/auth-client";

export default function AdminSidebar({
  isOpen = false,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<UserProfile>(FALLBACK_GUEST_USER);

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      setActiveRole(mapUserProfileRecord(session.user));
    }
  }, [session]);

  const isAdmin = (activeRole?.role ?? "admin") === "admin";
  const isStudent = (activeRole?.role ?? "") === "student";

  // Dynamic Navigation Items based on Access Level
  const getNavItems = () => {
    if (isAdmin) {
      return [
        { label: "Admin Dashboard", href: "/admin", icon: "dashboard" },
        { label: "User Accounts", href: "/admin/users", icon: "manage_accounts" },
        { label: "Campuses (4)", href: "/admin/campuses", icon: "location_city" },
        { label: "Admissions Review", href: "/admin/admissions", icon: "school" },
        { label: "Yearbook & Honors", href: "/admin/yearbook", icon: "auto_stories" },
        { label: "Classes & Syllabi", href: "/admin/classes", icon: "menu_book" },
        { label: "Clubs & Activities", href: "/admin/clubs", icon: "groups" },
      ];
    }

    // Student Contributor View
    return [
      { label: "Contributor Hub", href: "/admin", icon: "dashboard" },
      { label: "Yearbook Entry", href: "/admin/yearbook", icon: "auto_stories" },
      { label: "Classes & Timetables", href: "/admin/classes", icon: "menu_book" },
      { label: "Clubs & Activities", href: "/admin/clubs", icon: "groups" },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`w-64 bg-[#09234B] text-white h-screen fixed left-0 top-0 flex flex-col z-50 lg:z-40 shadow-xl border-r border-[#FFC700]/20 transition-transform duration-200 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-white/10 gap-3">
        <div className="relative w-10 h-10 rounded-full bg-white p-0.5 ring-2 ring-[#FFC700] shadow-sm shrink-0">
          <Image src="/images/mainLogo.png" alt="Hinthar Logo" fill sizes="40px" className="object-contain" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-black text-sm text-white tracking-tight leading-tight truncate">
            Hinthar Portal
          </span>
          <span className="text-[10px] font-bold text-[#FFC700] uppercase tracking-wider">
            {isAdmin ? "School Administrator" : "Student Contributor"}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
        <p className="px-3 text-[11px] font-black text-[#FFC700] uppercase tracking-[0.16em] mb-3">
          {isStudent ? "Student Workspace" : "Management Hub"}
        </p>

        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (window.innerWidth < 1024) onClose?.();
              }}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 text-xs font-bold uppercase tracking-wider ${
                isActive
                  ? "bg-[#FFC700] text-[#09234B] shadow-md font-black"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span
                aria-hidden="true"
                className={`material-symbols-outlined text-lg ${
                  isActive ? "text-[#09234B] font-bold" : "text-[#FFC700]"
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Live Site Shortcut */}
        <div className="pt-6">
          <p className="px-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.16em] mb-2">
            Public Gateway
          </p>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base text-[#FFC700]">open_in_new</span>
            <span>View Public Site</span>
          </Link>
        </div>
      </div>

      {/* Active User Footer Info & Sign Out */}
      <div className="p-4 border-t border-white/10 bg-[#061833] space-y-3">
        <div className="flex items-center gap-2.5 px-1">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${activeRole?.badgeColor || "bg-[#FFC700] text-[#09234B]"}`}
          >
            {activeRole?.initials || (activeRole?.fullName || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{activeRole?.fullName || "Administrator"}</p>
            <p className="text-[10px] text-[#FFC700] font-semibold truncate">
              {activeRole?.roleLabel || "Administrator"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={async () => {
            try {
              await authClient.signOut();
            } catch (err) {
              console.warn("Sidebar sign out error:", err);
            }
            router.push("/admin/login");
            router.refresh();
          }}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-red-500/10 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 rounded-xl transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
