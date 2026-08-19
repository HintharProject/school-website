"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify and try again.");
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({
          password: password,
        });

        if (error) {
          setErrorMsg(error.message);
          setIsLoading(false);
          return;
        }
      }

      setSuccessMsg("Password successfully set! Redirecting to Hinthar Admin Portal...");
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update password.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09234B] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E40AF_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FFC700]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-100">
        {/* School Crest & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0E3B7D] rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-900/20 mb-4 border border-[#FFC700]/40">
            <span className="material-symbols-outlined text-3xl text-[#FFC700]">lock_reset</span>
          </div>
          <h1 className="text-2xl font-black text-[#09234B] tracking-tight">Set Your Account Password</h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Welcome to <strong className="text-[#0E3B7D]">Hinthar International School</strong>. Please set a secure password to complete your account activation.
          </p>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-sm">
            <span className="material-symbols-outlined text-rose-500 text-lg flex-shrink-0 mt-0.5">error</span>
            <div>
              <p className="font-bold">Setup Error</p>
              <p className="text-xs text-rose-600 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-700 text-sm animate-pulse">
            <span className="material-symbols-outlined text-emerald-500 text-lg flex-shrink-0 mt-0.5">check_circle</span>
            <div>
              <p className="font-bold">Success</p>
              <p className="text-xs text-emerald-600 mt-0.5">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D] focus:border-transparent transition-all"
              />
              <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 text-lg pointer-events-none">
                key
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Minimum 8 characters with letters & numbers.</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E3B7D] focus:border-transparent transition-all"
              />
              <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 text-lg pointer-events-none">
                lock
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || Boolean(successMsg)}
            className="w-full py-3.5 px-6 rounded-xl bg-[#0E3B7D] hover:bg-[#09234B] text-white text-sm font-bold shadow-lg shadow-blue-900/20 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Activating Account...</span>
              </>
            ) : (
              <>
                <span>Save Password & Enter Portal</span>
                <span className="material-symbols-outlined text-sm text-[#FFC700]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link
            href="/admin/login"
            className="text-xs font-semibold text-slate-500 hover:text-[#0E3B7D] transition-colors"
          >
            Already have an active password? Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
