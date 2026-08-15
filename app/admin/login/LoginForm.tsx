"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ADMIN_ROLES, setActiveAdminRole, AdminRoleUser } from "../adminStore";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admissions.head@hinthar.education");
  const [password, setPassword] = useState("••••••••");
  const [selectedRole, setSelectedRole] = useState<AdminRoleUser>(ADMIN_ROLES[0]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveAdminRole(selectedRole.id);
    router.push("/admin");
  };

  const handleQuickSelectRole = (role: AdminRoleUser) => {
    setSelectedRole(role);
    setEmail(role.email);
    setPassword("hinthar2026");
    setActiveAdminRole(role.id);
    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0E3B7D]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFC700]/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-lg relative z-10 space-y-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8 pb-4 text-center">
            <div className="relative h-16 w-16 mx-auto mb-4 rounded-full overflow-hidden bg-white p-1 ring-2 ring-[#FFC700] shadow-xs">
              <Image src="/images/mainLogo.png" alt="Hinthar Logo" fill className="object-contain" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F0FE] text-[#0E3B7D] text-[10px] font-black uppercase tracking-wider mb-2 border border-[#0E3B7D]/20">
              <span>Pearson Centre 11051</span>
            </div>
            <h1 className="text-2xl font-black text-[#09234B] tracking-tight">Faculty &amp; Staff Portal</h1>
            <p className="text-xs text-slate-500 mt-1">Interactive Prototype for Stakeholder Evaluation</p>
          </div>

          {/* Quick 1-Click Role Login for Stakeholders */}
          <div className="px-8 pt-2">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 text-center">
                1-Click Stakeholder Demo Access
              </p>
              <div className="grid grid-cols-1 gap-2">
                {ADMIN_ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleQuickSelectRole(role)}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white hover:bg-[#E8F0FE] border border-slate-200 hover:border-[#0E3B7D]/40 text-left transition-all group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${role.badgeColor}`}>
                      {role.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-[#09234B] group-hover:text-[#0E3B7D] truncate">
                        {role.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium truncate">{role.role}</p>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-[#0E3B7D] text-base">
                      login
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-8 my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">or sign in manually</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleLogin} className="px-8 pb-8 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">Faculty Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-slate-900 text-xs"
                  placeholder="faculty@hinthar.education"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">lock</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-slate-900 text-xs"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0E3B7D] hover:bg-[#164E9A] text-white py-3 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all mt-4 flex items-center justify-center gap-2 text-xs"
            >
              <span>Sign In to Admin Portal</span>
              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </button>
          </form>

          <div className="bg-slate-50 p-4 text-center border-t border-slate-200">
            <Link href="/" className="text-xs font-bold text-slate-600 hover:text-[#0E3B7D] transition-colors inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
