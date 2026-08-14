"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0E3B7D]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFC700]/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8 pb-0 text-center">
            <div className="relative h-16 w-16 mx-auto mb-4 rounded-full overflow-hidden bg-white p-1 ring-2 ring-[#FFC700] shadow-sm">
              <Image src="/images/mainLogo.png" alt="Hinthar Logo" fill className="object-contain" />
            </div>
            <h1 className="text-2xl font-black text-[#09234B] tracking-tight">Faculty &amp; Staff Portal</h1>
            <p className="text-xs text-slate-500 mt-1">Sign in with your administrative credentials</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">Faculty Email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-slate-900 text-sm"
                  placeholder="faculty@hinthar.education"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">lock</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-slate-900 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-[#0E3B7D] focus:ring-[#0E3B7D]" />
                <span className="text-xs text-slate-600 font-medium">Remember me</span>
              </label>
              <span className="text-xs font-bold text-[#0E3B7D] hover:underline cursor-pointer">Forgot password?</span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0E3B7D] hover:bg-[#164E9A] text-white py-3.5 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all mt-6 flex items-center justify-center gap-2 text-xs"
            >
              <span>Sign In to Portal</span>
              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </button>
          </form>

          <div className="bg-slate-50 p-4 text-center border-t border-slate-200">
            <Link href="/" className="text-xs font-bold text-slate-600 hover:text-[#0E3B7D] transition-colors flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to School Website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
