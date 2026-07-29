"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "../../components/ThemeProvider";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { theme, toggleTheme } = useTheme();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would authenticate. We will just redirect to the dashboard.
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-surface dark:bg-background px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-academic-gold/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      
      {/* Theme Toggle Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-surface dark:bg-surface-variant shadow-sm border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-sm">{theme === "dark" ? "light_mode" : "dark_mode"}</span>
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-surface dark:bg-surface-variant rounded-3xl shadow-xl border border-outline-variant/30 overflow-hidden">
          <div className="p-8 pb-0 text-center">
            <div className="relative h-16 w-16 mx-auto mb-4">
              <Image src="/images/logo.png" alt="Hinthar Logo" fill className="object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-oxford-blue dark:text-white tracking-tight">Staff Portal</h1>
            <p className="text-sm text-on-surface-variant mt-1">Sign in to manage the school website</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider pl-1">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg">mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white text-sm"
                  placeholder="admin@hinthar.edu.mm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider pl-1">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg">lock</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-neutral-surface dark:bg-black/20 border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all dark:text-white text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-outline-variant/30 text-primary focus:ring-primary dark:bg-black/20" />
                <span className="text-sm text-on-surface-variant">Remember me</span>
              </label>
              <a href="#" className="text-sm font-bold text-primary dark:text-primary-fixed hover:underline">Forgot password?</a>
            </div>

            <button type="submit" className="w-full bg-primary text-white dark:bg-primary-fixed dark:text-oxford-blue py-3.5 rounded-xl font-bold uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform mt-6 flex items-center justify-center gap-2">
              Sign In <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </form>
          
          <div className="bg-neutral-surface dark:bg-black/20 p-4 text-center border-t border-outline-variant/30">
            <Link href="/" className="text-sm text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to main website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
