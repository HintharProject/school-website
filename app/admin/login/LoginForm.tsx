"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { acceptInviteAction, ensureAdminReadyAction } from "@/lib/actions/users";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const inviteTokenParam = searchParams.get("inviteToken");
  const emailParam = searchParams.get("email");

  const targetUrl =
    redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
      ? redirectParam
      : "/admin";

  const [email, setEmail] = useState(emailParam || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isInviteMode = Boolean(inviteTokenParam);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const enteredEmail = email.trim().toLowerCase();

    try {
      // Ensure initial admin is provisioned before login
      await ensureAdminReadyAction().catch(() => {});

      const { data, error } = await authClient.signIn.email({
        email: enteredEmail,
        password,
      });

      if (error) {
        setErrorMessage(error.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      if (data?.user) {
        if ((data.user as any).status === "inactive" || (data.user as any).status === "suspended") {
          await authClient.signOut();
          setErrorMessage("This account has been deactivated by the School Administration.");
          setLoading(false);
          return;
        }

        router.push(targetUrl);
        router.refresh();
        return;
      }
    } catch (err: any) {
      console.warn("Auth error:", err);
      setErrorMessage(err.message || "Authentication failed. Please check your credentials.");
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteTokenParam) return;

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await acceptInviteAction(inviteTokenParam, password);
      if (res.success) {
        setSuccessMessage("Invitation accepted! Signing you into the portal...");
        // Automatically sign in with new credentials
        const loginRes = await authClient.signIn.email({
          email: res.email,
          password,
        });

        if (loginRes.data) {
          router.push(targetUrl);
          router.refresh();
        } else {
          router.push("/admin/login");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to accept invitation.");
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
              <Image src="/images/mainLogo.png" alt="Hinthar Logo" fill sizes="64px" className="object-contain" priority />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E8F0FE] text-[#0E3B7D] text-[10px] font-black uppercase tracking-wider mb-2 border border-[#0E3B7D]/20">
              <span className="material-symbols-outlined text-xs">shield_lock</span>
              <span>Pearson Edexcel Centre 11051</span>
            </div>

            <h1 className="text-2xl font-black text-[#09234B] tracking-tight">
              {isInviteMode ? "Activate Account" : "Hinthar Portal"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isInviteMode
                ? "Set a password to complete your account onboarding."
                : "Authorized access for School Administrators & Student Contributors"}
            </p>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="mx-8 mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5">
              <span className="material-symbols-outlined text-base shrink-0 text-red-500 mt-0.5">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mx-8 mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-start gap-2.5">
              <span className="material-symbols-outlined text-base shrink-0 text-emerald-500 mt-0.5">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          {isInviteMode ? (
            <form onSubmit={handleAcceptInvite} className="px-8 py-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider pl-1">
                  Invited Email
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-xs cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider pl-1">
                  Create Password (min. 8 chars)
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-slate-900 text-xs"
                  placeholder="Enter strong password"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider pl-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0E3B7D] outline-none transition-all text-slate-900 text-xs"
                  placeholder="Repeat password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0E3B7D] hover:bg-[#164E9A] text-white py-3 rounded-xl font-black uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all mt-2 flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? "Activating Account..." : "Accept & Enter Portal"}</span>
                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
              </button>
            </form>
          ) : (
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
                className="w-full bg-[#0E3B7D] hover:bg-[#164E9A] text-white py-3 rounded-xl font-black uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all mt-2 flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? "Verifying Credentials..." : "Sign In to Portal"}</span>
                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
              </button>
            </form>
          )}

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
