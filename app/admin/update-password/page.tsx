"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Key, WarningCircle, CheckCircle, ArrowRight } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth/auth-client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify and try again.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (res.error) {
        setErrorMsg(
          res.error.message ||
            "Failed to update password. Please verify your current password."
        );
        setIsLoading(false);
        return;
      }

      setSuccessMsg("Password updated! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/admin");
      }, 1200);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to update password."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-hinthar p-8 border border-slate-200">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#EEF3FC] text-[#193E8A] rounded-2xl mx-auto flex items-center justify-center mb-3">
            <Key className="w-7 h-7" weight="duotone" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1E232B] tracking-tight">
            Change Password
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update your Hinthar International School portal password.
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs font-semibold"
          >
            <WarningCircle className="w-4 h-4 shrink-0 mt-0.5" weight="fill" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-700 text-xs font-semibold"
          >
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" weight="fill" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-[#193E8A] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              New Password (min. 8 characters)
            </label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-[#193E8A] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:border-[#193E8A] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || Boolean(successMsg)}
            className="w-full py-3 px-6 rounded-xl bg-[#193E8A] hover:bg-[#2352B0] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-colors"
          >
            <span>{isLoading ? "Updating..." : "Save New Password"}</span>
            <ArrowRight className="w-4 h-4" weight="bold" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link
            href="/admin"
            className="text-xs font-bold text-[#193E8A] hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
