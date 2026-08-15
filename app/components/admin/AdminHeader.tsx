"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ADMIN_ROLES,
  getActiveAdminRole,
  setActiveAdminRole,
  resetAllDemoData,
  AdminRoleUser,
} from "../../admin/adminStore";

export default function AdminHeader() {
  const [activeRole, setActiveRole] = useState<AdminRoleUser>(ADMIN_ROLES[0]);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveRole(getActiveAdminRole());

    const handleRoleUpdate = () => {
      setActiveRole(getActiveAdminRole());
    };

    window.addEventListener("his_role_updated", handleRoleUpdate);
    return () => window.removeEventListener("his_role_updated", handleRoleUpdate);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectRole = (role: AdminRoleUser) => {
    setActiveAdminRole(role.id);
    setActiveRole(role);
    setRoleDropdownOpen(false);
    showToast(`Switched active view to ${role.role} (${role.name})`);
  };

  const handleResetData = () => {
    if (window.confirm("Reset all prototype data back to initial Hinthar school defaults?")) {
      resetAllDemoData();
      showToast("Prototype demo data successfully reset!");
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const mockNotifications = [
    {
      id: 1,
      title: "New Admission Application",
      desc: "Aung Kaung Myat applied for Pearson IAL (Year 12)",
      time: "10m ago",
      icon: "assignment_ind",
      unread: true,
    },
    {
      id: 2,
      title: "Assessment Scheduled",
      desc: "Zaw Lin Htet booked diagnostic test for Year 8",
      time: "1h ago",
      icon: "event",
      unread: true,
    },
    {
      id: 3,
      title: "Pearson Edexcel Bulletin",
      desc: "Oct/Nov candidate registration series deadline approaching",
      time: "2h ago",
      icon: "campaign",
      unread: false,
    },
  ];

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-30 shadow-xs">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#09234B] text-white px-4 py-2.5 rounded-xl shadow-2xl border border-[#FFC700] text-xs font-bold flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[#FFC700] text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb / Title Area */}
      <div className="flex items-center gap-3">
        <div className="relative w-64 sm:w-80 hidden md:block">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base">
            search
          </span>
          <input
            type="text"
            placeholder="Quick search student, class, notice..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0E3B7D]"
          />
        </div>
      </div>

      {/* Right Controls: Reset Data, Live Site, Notifications, Role Switcher */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Reset Demo Data Button */}
        <button
          onClick={handleResetData}
          title="Reset prototype state back to default mock data"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-[#09234B] text-[11px] font-bold transition-all"
        >
          <span className="material-symbols-outlined text-sm">restart_alt</span>
          <span>Reset Demo</span>
        </button>

        {/* Visit Site Button */}
        <Link
          href="/"
          target="_blank"
          className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8F0FE] hover:bg-[#0E3B7D] text-[#0E3B7D] hover:text-white text-[11px] font-black transition-all"
        >
          <span className="material-symbols-outlined text-sm">visibility</span>
          <span>Live Site</span>
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
                    Administrative Alerts
                  </h4>
                  <p className="text-[11px] text-slate-400">Recent admissions &amp; exams activity</p>
                </div>
                <span className="text-[10px] font-bold bg-[#E8F0FE] text-[#0E3B7D] px-2 py-0.5 rounded-md">
                  2 New
                </span>
              </div>

              <div className="divide-y divide-slate-100 my-2">
                {mockNotifications.map((n) => (
                  <div key={n.id} className="py-2.5 flex items-start gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors">
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
                  </div>
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

        {/* Role Switcher Dropdown */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shadow-xs ${activeRole.badgeColor}`}>
              {activeRole.initials}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-black text-[#09234B] leading-none">{activeRole.name}</p>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#FFC700] text-[#09234B]">
                  Role
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-none mt-1 truncate max-w-[150px]">
                {activeRole.role}
              </p>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-base">expand_more</span>
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Demo Stakeholder Roles
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  Switch persona to test permissions &amp; views
                </p>
              </div>

              <div className="space-y-1">
                {ADMIN_ROLES.map((role) => {
                  const isCurrent = activeRole.id === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleSelectRole(role)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                        isCurrent
                          ? "bg-[#E8F0FE] text-[#0E3B7D] font-bold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${role.badgeColor}`}>
                        {role.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black text-[#09234B] truncate">{role.name}</p>
                          {isCurrent && (
                            <span className="material-symbols-outlined text-[#0E3B7D] text-sm">
                              check_circle
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium truncate">{role.role}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 px-2">
                <Link
                  href="/admin/login"
                  className="flex items-center justify-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span>Exit to Login Screen</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
