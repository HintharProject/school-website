"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  LOCALE_STORAGE_KEY,
  translate,
  type Locale,
  type TranslateKey,
} from "./index";

// ---------------------------------------------------------------------------
// Tiny module-level store shared by every component on the page, so a single
// language toggle in the navbar re-renders the footer and all sections too.
// ---------------------------------------------------------------------------

let currentLocale: Locale = "en";
const listeners = new Set<() => void>();

try {
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === "my" || stored === "en") {
    currentLocale = stored;
  }
} catch {
  // localStorage unavailable (private mode etc.) — default English
}

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.cookie = `hinthar-locale=${locale};path=/;max-age=31536000;samesite=lax`;
  } catch {
    // non-fatal
  }
  listeners.forEach((fn) => fn());
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/** Reactive locale for the current component tree. */
export function useLocale(): Locale {
  return useSyncExternalStore(
    subscribe,
    () => currentLocale,
    () => "en" as Locale
  );
}

/**
 * Translation hook. Usage:
 *   const t = useT();
 *   <h1>{t("news.pageTitle")}</h1>
 * Keys live in messages/en.json and messages/my.json — correct translations
 * in those two files only, no page hunting.
 */
export function useT() {
  const locale = useLocale();
  return useCallback((key: TranslateKey) => translate(locale, key), [locale]);
}
