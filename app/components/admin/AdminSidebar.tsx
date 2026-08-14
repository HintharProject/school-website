"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Admissions", href: "/admin/admissions", icon: "school" },
  { label: "Yearbook & Alumni", href: "/admin/yearbook", icon: "auto_stories" },
  { label: "Classes & Syllabi", href: "/admin/classes", icon: "menu_book" },
  { label: "Student Clubs", href: "/admin/clubs", icon: "groups" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#09234B] text-white h-screen fixed left-0 top-0 flex flex-col z-40 shadow-xl border-r border-[#FFC700]/20">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-white/10 gap-3">
        <div className="relative w-10 h-10 rounded-full bg-white p-0.5 ring-2 ring-[#FFC700] shadow-sm shrink-0">
          <Image src="/images/mainLogo.png" alt="Hinthar Logo" fill className="object-contain" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-black text-sm text-white tracking-tight leading-tight truncate">
            Hinthar Admin
          </span>
          <span className="text-[10px] font-bold text-[#FFC700] uppercase tracking-wider">
            Staff Portal
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
        <p className="px-3 text-[11px] font-black text-[#FFC700] uppercase tracking-[0.16em] mb-3">
          Management Hub
        </p>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 text-xs font-bold uppercase tracking-wider ${
                isActive
                  ? "bg-[#FFC700] text-[#09234B] shadow-md font-black"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className={`material-symbols-outlined text-lg ${isActive ? "text-[#09234B] font-bold" : "text-[#FFC700]"}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Live Site Shortcut */}
        <div className="pt-6">
          <p className="px-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.16em] mb-2">
            Public Site
          </p>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-base text-[#FFC700]">open_in_new</span>
            <span>View Live Website</span>
          </Link>
        </div>
      </div>

      {/* Footer Sign Out */}
      <div className="p-4 border-t border-white/10 bg-[#061833]">
        <Link
          href="/admin/login"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-red-500/10 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
