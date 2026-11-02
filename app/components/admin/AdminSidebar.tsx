"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SquaresFour,
  House,
  Buildings,
  GraduationCap,
  UsersThree,
  IdentificationBadge,
  UserGear,
  Key,
  SignOut,
  CaretUp,
  CaretDown,
} from "@phosphor-icons/react";
import {
  UserProfile,
  FALLBACK_GUEST_USER,
  mapUserProfileRecord,
} from "../../admin/adminStore";
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

  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
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

  const isAdmin = activeRole.role === "admin";

  const adminItems = [
    { label: "Overview & Approvals", href: "/admin", Icon: SquaresFour },
    { label: "Home & Classes", href: "/admin/home", Icon: House },
    { label: "Campuses", href: "/admin/campuses", Icon: Buildings },
    { label: "Yearbook", href: "/admin/yearbook", Icon: GraduationCap },
    { label: "Clubs & Activities", href: "/admin/clubs", Icon: UsersThree },
    { label: "Admissions", href: "/admin/admissions", Icon: IdentificationBadge },
    { label: "Users & Invitations", href: "/admin/users", Icon: UserGear },
  ];

  const studentItems = [
    { label: "Contributor Hub", href: "/admin", Icon: SquaresFour },
    { label: "My Yearbook Entry", href: "/admin/yearbook", Icon: GraduationCap },
    { label: "Clubs & Activities", href: "/admin/clubs", Icon: UsersThree },
  ];

  const navItems = isAdmin ? adminItems : studentItems;

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

  const displayName = activeRole.fullName || "Signed Out";
  const initials = activeRole.initials || "?";

  return (
    <aside
      className={`w-64 bg-[#0F2759] text-white h-screen fixed left-0 top-0 flex flex-col z-[60] shadow-xl border-r border-white/10 transition-transform duration-200 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/10 shrink-0">
        <span className="font-extrabold text-xs text-[#FFD600] uppercase tracking-widest">
          {isAdmin ? "Website CMS & Portal" : "Contributor Portal"}
        </span>
      </div>

      <nav
        className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5"
        aria-label="Portal navigation"
      >
        {navItems.map(({ label, href, Icon }) => {
          const isActive =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => {
                if (window.innerWidth < 1024) onClose?.();
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#FFD600] text-[#162033] shadow-xs font-extrabold"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? "text-[#162033]" : "text-[#FFD600]"
                }`}
                weight={isActive ? "fill" : "duotone"}
              />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Account Menu */}
      <div
        ref={profileRef}
        className="relative p-4 border-t border-white/10 bg-[#0A1B3F]"
      >
        {profileOpen && (
          <div
            role="menu"
            aria-label="Account options"
            className="absolute bottom-full left-4 right-4 mb-2 rounded-2xl bg-white shadow-2xl border border-slate-200 p-3 space-y-1 animate-fade-in"
          >
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 mb-1">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${activeRole.badgeColor}`}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-[#1E232B] truncate">
                  {activeRole.fullName}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {activeRole.email}
                </p>
              </div>
            </div>

            <div className="space-y-0.5 text-xs font-bold text-slate-700">
              {isAdmin && (
                <Link
                  href="/admin/users"
                  onClick={() => setProfileOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[#193E8A] transition-colors"
                >
                  <UserGear className="w-4 h-4 text-[#193E8A]" weight="bold" />
                  <span>Users & Invitations</span>
                </Link>
              )}
              <Link
                href="/admin/update-password"
                onClick={() => setProfileOpen(false)}
                role="menuitem"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[#193E8A] transition-colors"
              >
                <Key className="w-4 h-4 text-[#193E8A]" weight="bold" />
                <span>Change Password</span>
              </Link>
            </div>

            <div className="pt-1.5 border-t border-slate-100">
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all text-xs font-bold disabled:opacity-60 cursor-pointer"
              >
                <SignOut className="w-4 h-4" weight="bold" />
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
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${activeRole.badgeColor}`}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-[#FFD600] font-semibold truncate">
              {activeRole.roleLabel}
            </p>
          </div>
          {profileOpen ? (
            <CaretDown className="w-4 h-4 text-slate-300" weight="bold" />
          ) : (
            <CaretUp className="w-4 h-4 text-slate-300" weight="bold" />
          )}
        </button>
      </div>
    </aside>
  );
}
