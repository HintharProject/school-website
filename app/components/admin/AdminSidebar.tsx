"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Admissions", href: "/admin/admissions", icon: "school" },
  { label: "Yearbook", href: "/admin/yearbook", icon: "photo_album" },
  { label: "Classes", href: "/admin/classes", icon: "menu_book" },
  { label: "Clubs", href: "/admin/clubs", icon: "groups" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface dark:bg-surface-variant border-r border-outline-variant/30 h-screen fixed left-0 top-0 flex flex-col z-40 shadow-sm">
      <div className="h-16 flex items-center px-6 border-b border-outline-variant/30">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="relative h-8 w-8">
            <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className="font-bold text-oxford-blue dark:text-white tracking-tight">Admin Portal</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <p className="px-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4">Management</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-fixed font-bold"
                  : "text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/5 hover:text-oxford-blue dark:hover:text-white font-medium"
              }`}
            >
              <span className={`material-symbols-outlined text-xl ${isActive ? "fill-current" : ""}`}>
                {item.icon}
              </span>
              <span className="text-sm tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-outline-variant/30">
        <Link
          href="/admin/login"
          className="flex items-center gap-3 px-3 py-2.5 text-error dark:text-red-400 hover:bg-error-container dark:hover:bg-red-900/30 rounded-xl transition-colors text-sm font-bold"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
