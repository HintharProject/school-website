"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const targetUrl = redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//") ? redirectParam : "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    if (!isSupabaseConfigured) {
      setErrorMessage("Authentication service is not configured. Please contact the school administrator.");
      setLoading(false);
      return;
    }

    const enteredEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: enteredEmail,
        password,
      });

      if (error) {
        setErrorMessage(error.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      if (data.user) {
        // Fetch profile from user_profiles table to check account status
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role, status, full_name")
          .eq("id", data.user.id)
          .single();

        if (profile && profile.status !== "active") {
          await supabase.auth.signOut();
          setErrorMessage("This account has been suspended by the School Administration.");
          setLoading(false);
          return;
        }

        // Supabase session cookie is now set automatically by @supabase/ssr
        router.push(targetUrl);
        router.refresh();
        return;
      }
    } catch (err: any) {
      console.warn("Supabase auth error:", err);
      setErrorMessage(err.message || "Authentication failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0E3B7D]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#FFC700]/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-6 text-center border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
            <div className="relative h-16 w-16 mx-auto mb-3 rounded-full overflow-hidden bg-white p-1 ring-2 ring-[#FFC700] shadow-sm">
              <Image src="/images/mainLogo.png" alt="Hinthar Logo" fill className="object-contain" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E8F0FE] text-[#0E3B7D] text-[10px] font-black uppercase tracking-wider mb-2 border border-[#0E3B7D]/20">
              <span className="material-symbols-outlined text-xs">shield_lock</span>
              <span>Pearson Edexcel Centre 11051</span>
            </div>

            <h1 className="text-2xl font-black text-[#09234B] tracking-tight">Hinthar Portal</h1>
            <p className="text-xs text-slate-500 mt-1">
              Authorized access for School Principal, Faculty &amp; Student Contributors
            </p>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="mx-8 mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5">
              <span className="material-symbols-outlined text-base shrink-0 text-red-500 mt-0.5">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Password Form */}
          <form onSubmit={handlePasswordLogin} className="px-8 py-6 space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider pl-1">
                School Account Email
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-base">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-slate-900 text-xs"
                  placeholder="name@hinthar.education"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center pl-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] font-bold text-slate-500 hover:text-slate-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-base">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-slate-900 text-xs"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0E3B7D] hover:bg-[#164E9A] text-white py-3 rounded-xl font-black uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all mt-2 flex items-center justify-center gap-2 text-xs disabled:opacity-50"
            >
              <span>{loading ? "Verifying Credentials..." : "Sign In to Portal"}</span>
              <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
            </button>
          </form>

          {/* Principal Direct Provisioning Footer Notice */}
          <div className="bg-slate-50 p-4 text-center border-t border-slate-200 space-y-2">
            <p className="text-[11px] text-slate-500 font-medium">
              🔒 <strong>Closed Registration</strong>: Accounts are directly provisioned by <strong>School Administration</strong>.
            </p>
            <Link
              href="/"
              className="text-xs font-bold text-[#0E3B7D] hover:underline inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to Hinthar Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
