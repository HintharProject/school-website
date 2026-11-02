"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  WarningCircle,
  CheckCircle,
  EnvelopeSimple,
  LockKey,
  ArrowRight,
  ArrowLeft,
} from "@phosphor-icons/react";
import { authClient } from "@/lib/auth/auth-client";
import { acceptInviteAction } from "@/lib/actions/users";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const inviteTokenParam = searchParams.get("inviteToken");
  const emailParam = searchParams.get("email");

  const targetUrl =
    redirectParam &&
    redirectParam.startsWith("/") &&
    !redirectParam.startsWith("//")
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
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrorMessage(error.message || "Invalid email or password.");
        setLoading(false);
        return;
      }

      if (data?.user) {
        const status = (data.user as { status?: string }).status;
        if (status === "inactive" || status === "suspended") {
          await authClient.signOut();
          setErrorMessage(
            "This account has been deactivated by School Administration."
          );
          setLoading(false);
          return;
        }
        router.push(targetUrl);
        router.refresh();
        return;
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Authentication failed. Please check your credentials."
      );
    } finally {
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
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to accept invitation."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-3xl shadow-hinthar border border-slate-200 overflow-hidden">
          <div className="p-8 pb-6 text-center border-b border-slate-100 bg-gradient-to-b from-[#EEF3FC]/60 to-white">
            <div className="relative h-16 w-16 mx-auto mb-3 rounded-full overflow-hidden bg-white p-1 ring-2 ring-[#FFD600] shadow-xs">
              <Image
                src="/images/hinthar-logo.webp"
                alt="Hinthar International School"
                fill
                sizes="64px"
                className="object-contain"
                priority
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF3FC] text-[#193E8A] text-[11px] font-extrabold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" weight="fill" />
              <span>Hinthar International School</span>
            </div>

            <h1 className="text-2xl font-extrabold text-[#1E232B] tracking-tight">
              {isInviteMode ? "Activate Portal Account" : "Portal Sign In"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isInviteMode
                ? "Create your password to finish account setup."
                : "School Administrators & Student Contributors"}
            </p>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mx-8 mt-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2"
            >
              <WarningCircle className="w-4 h-4 shrink-0 mt-0.5" weight="fill" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="mx-8 mt-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-start gap-2"
            >
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" weight="fill" />
              <span>{successMessage}</span>
            </div>
          )}

          {isInviteMode ? (
            <form onSubmit={handleAcceptInvite} className="px-8 py-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Invited Email
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Create Password (min. 8 characters)
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-[#193E8A] outline-none text-sm"
                  placeholder="Enter strong password"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-[#193E8A] outline-none text-sm"
                  placeholder="Repeat password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#193E8A] hover:bg-[#2352B0] text-white py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-colors"
              >
                <span>
                  {loading ? "Activating Account..." : "Accept & Enter Portal"}
                </span>
                <ArrowRight className="w-4 h-4" weight="bold" />
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordLogin} className="px-8 py-6 space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-bold text-slate-700 mb-1"
                >
                  Account Email
                </label>
                <div className="relative">
                  <EnvelopeSimple
                    className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                    weight="bold"
                  />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-[#193E8A] outline-none text-sm"
                    placeholder="name@hinthar.education"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="login-password"
                    className="text-xs font-bold text-slate-700"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-bold text-[#193E8A] hover:underline cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="relative">
                  <LockKey
                    className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                    weight="bold"
                  />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-[#193E8A] outline-none text-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#193E8A] hover:bg-[#2352B0] text-white py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-colors"
              >
                <span>
                  {loading ? "Signing In..." : "Sign In to Portal"}
                </span>
                <ArrowRight className="w-4 h-4" weight="bold" />
              </button>
            </form>
          )}

          <div className="bg-slate-50 p-4 text-center border-t border-slate-200 space-y-2">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <LockKey className="w-3.5 h-3.5 text-[#193E8A] shrink-0" weight="bold" />
              <span>
                Closed registration — accounts are provisioned by School Administration.
              </span>
            </p>
            <Link
              href="/"
              className="text-xs font-bold text-[#193E8A] hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" weight="bold" />
              <span>Back to Public Website</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
