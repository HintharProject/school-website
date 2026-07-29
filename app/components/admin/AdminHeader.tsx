"use client";

import { useTheme } from "../ThemeProvider";

export default function AdminHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-surface dark:bg-surface-variant border-b border-outline-variant/30 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
      <div className="flex-1" /> {/* Spacer */}
      
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-black/5 dark:text-on-surface dark:hover:bg-white/5 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          <span className="material-symbols-outlined">{theme === "dark" ? "light_mode" : "dark_mode"}</span>
        </button>

        {/* Notifications */}
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-black/5 dark:text-on-surface dark:hover:bg-white/5 transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full animate-pulse" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-oxford-blue dark:text-white leading-tight">Admin User</p>
            <p className="text-xs text-on-surface-variant">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-fixed font-bold shadow-sm">
            AU
          </div>
        </div>
      </div>
    </header>
  );
}
