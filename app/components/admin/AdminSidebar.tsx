"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session?.user) {
      setActiveRole(mapUserProfileRecord(session.user));
    }
  }, [session]);

  // Close profile menu on outside click or Escape
  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileOpen]);

  const isAdmin = (activeRole?.role ?? "") === "admin";

  // Admin: 4 accordion groups (all collapsed by default), Noticeboard merged into News & Notices
  type NavGroup = { id: string; label: string; icon: string; items: { label: string; href: string; icon: string }[] };
  const adminGroups: NavGroup[] = [
    {
      id: "admissions",
      label: "Admissions",
      icon: "school",
      items: [{ label: "Admissions Review", href: "/admin/admissions", icon: "school" }],
    },
    {
      id: "academics",
      label: "Academics",
      icon: "menu_book",
      items: [
        { label: "Classes & Syllabi", href: "/admin/classes", icon: "menu_book" },
        { label: "Clubs & Activities", href: "/admin/clubs", icon: "groups" },
        { label: "Yearbook & Honors", href: "/admin/yearbook", icon: "auto_stories" },
        { label: "News & Notices", href: "/admin/news", icon: "newspaper" },
      ],
    },
    {
      id: "campusPeople",
      label: "Campuses & People",
      icon: "location_city",
      items: [
        { label: "Campuses (4)", href: "/admin/campuses", icon: "location_city" },
        { label: "Staff Directory", href: "/admin/staff", icon: "badge" },
        { label: "Testimonials", href: "/admin/testimonials", icon: "reviews" },
        { label: "User Accounts", href: "/admin/users", icon: "manage_accounts" },
      ],
    },
    {
      id: "site",
      label: "Site",
      icon: "tune",
      items: [
        { label: "Admin Dashboard", href: "/admin", icon: "dashboard" },
        { label: "Site Content", href: "/admin/content", icon: "tune" },
        { label: "Help & Support", href: "/admin/help", icon: "support_agent" },
      ],
    },
  ];

  // Student Contributor View — keep flat limited 6
  const studentItems = [
    { label: "Contributor Hub", href: "/admin", icon: "dashboard" },
    { label: "Yearbook Entry", href: "/admin/yearbook", icon: "auto_stories" },
    { label: "Classes & Timetables", href: "/admin/classes", icon: "menu_book" },
    { label: "Clubs & Activities", href: "/admin/clubs", icon: "groups" },
    { label: "Noticeboard", href: "/admin/notices", icon: "campaign" },
    { label: "Help & Support", href: "/admin/help", icon: "support_agent" },
  ];

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (id: string) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const isGroupActive = (group: NavGroup) =>
    group.items.some((it) => (it.href === "/admin" ? pathname === "/admin" : pathname.startsWith(it.href)));

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setProfileOpen(false);
    try {
      await authClient.signOut();
    } catch (err) {
      console.warn("Sidebar sign out error:", err);
    }
    router.push("/admin/login");
    router.refresh();
  };

  const displayName = activeRole?.fullName || "Signed Out";
  const initials =
    activeRole?.initials || (displayName !== "Signed Out" ? displayName.charAt(0).toUpperCase() : "?");

  return (
    <aside
      className={`w-64 bg-[#09234B] text-white h-screen fixed left-0 top-0 flex flex-col z-[60] shadow-xl border-r border-[#FFC700]/20 transition-transform duration-200 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Section Header */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <span className="font-black text-sm text-[#FFC700] uppercase tracking-[0.2em]">
          Dashboard
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-3" aria-label="Portal navigation">
        {isAdmin ? (
          adminGroups.map((group) => {
            const expanded = !!openGroups[group.id];
            const groupActive = isGroupActive(group);
            return (
              <div key={group.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={expanded}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    groupActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span aria-hidden="true" className="material-symbols-outlined text-base text-[#FFC700]">
                      {group.icon}
                    </span>
                    <span>{group.label}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`material-symbols-outlined text-sm transition-transform ${expanded ? "rotate-180" : ""}`}
                  >
                    expand_more
                  </span>
                </button>

                <div className={`space-y-1 pl-1 overflow-hidden transition-all ${expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
                  {group.items.map((item) => {
                    const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          if (window.innerWidth < 1024) onClose?.();
                        }}
                        className={`flex items-center gap-2.5 px-3 py-2 ml-2 rounded-lg text-xs font-bold transition-all ${
                          isActive
                            ? "bg-[#FFC700] text-[#09234B] shadow-sm"
                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span aria-hidden="true" className={`material-symbols-outlined text-base ${isActive ? "text-[#09234B]" : "text-white/70"}`}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="space-y-1.5">
            {studentItems.map((item) => {
              const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose?.();
                  }}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 text-xs font-bold uppercase tracking-wider ${
                    isActive ? "bg-[#FFC700] text-[#09234B] shadow-md font-black" : "text-slate-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span aria-hidden="true" className={`material-symbols-outlined text-lg ${isActive ? "text-[#09234B] font-bold" : "text-[#FFC700]"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Profile Box with Dropdown (moved from header top-right) */}
      <div ref={profileRef} className="relative p-4 border-t border-white/10 bg-[#061833]">
        {profileOpen && (
          <div
            role="menu"
            aria-label="Account options"
            className="absolute bottom-full left-4 right-4 mb-2 rounded-2xl bg-white shadow-2xl border border-slate-200 p-3 space-y-1 animate-fade-in origin-bottom-left"
          >
            {/* Account Info */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 mb-1">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${activeRole?.badgeColor || "bg-[#FFC700] text-[#09234B]"}`}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-[#09234B] truncate">{activeRole?.fullName || "Account"}</p>
                <p className="text-[10px] text-slate-500 truncate">{activeRole?.email}</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#FFC700] text-[#09234B]">
                  {activeRole?.roleLabel || "Member"}
                </span>
              </div>
            </div>

            <div className="space-y-0.5 text-xs font-bold text-slate-700">
              {isAdmin && (
                <Link
                  href="/admin/users"
                  onClick={() => setProfileOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 hover:text-[#0E3B7D] transition-colors cursor-pointer"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-base text-[#0E3B7D]">manage_accounts</span>
                  <span>Manage User Accounts</span>
                </Link>
              )}
              <Link
                href={isAdmin ? "/admin/admissions" : "/admin/yearbook"}
                onClick={() => setProfileOpen(false)}
                role="menuitem"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 hover:text-[#0E3B7D] transition-colors cursor-pointer"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base text-[#0E3B7D]">
                  {isAdmin ? "school" : "auto_stories"}
                </span>
                <span>{isAdmin ? "Admissions Pipeline" : "My Submissions"}</span>
              </Link>
              <Link
                href="/admin/update-password"
                onClick={() => setProfileOpen(false)}
                role="menuitem"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 hover:text-[#0E3B7D] transition-colors cursor-pointer"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base text-[#0E3B7D]">lock_reset</span>
                <span>Change Password</span>
              </Link>
            </div>

            <div className="pt-1.5 border-t border-slate-100">
              <button
                type="button"
                role="menuitem"
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

        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={profileOpen}
          className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/10 transition-all text-left cursor-pointer"
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${activeRole?.badgeColor || "bg-[#FFC700] text-[#09234B]"}`}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{displayName}</p>
            <p className="text-[10px] text-[#FFC700] font-semibold truncate">
              {activeRole?.roleLabel || "Guest"}
            </p>
          </div>
          <span aria-hidden="true" className="material-symbols-outlined text-base text-slate-300">
            {profileOpen ? "expand_more" : "expand_less"}
          </span>
        </button>
      </div>
    </aside>
  );
}
