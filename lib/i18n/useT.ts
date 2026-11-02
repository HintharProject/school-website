"use client";

import { useCallback, useContext } from "react";
import {
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  translate,
  type Locale,
  type TranslateKey,
} from "./index";
import { LocaleContext } from "./LocaleProvider";

let fallbackLocale: Locale = "en";

export function getLocale(): Locale {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.dataset.locale;
    if (attr === "my" || attr === "en") return attr;
  }
  return fallbackLocale;
}

export function setLocale(next: Locale): void {
  fallbackLocale = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
      document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
      document.documentElement.lang = next;
      document.documentElement.dataset.locale = next;
    } catch {
      // non-fatal
    }
  }
}

export function useLocale(): Locale {
  const ctx = useContext(LocaleContext);
  return ctx?.locale ?? fallbackLocale;
}

export function useSetLocale(): (next: Locale) => void {
  const ctx = useContext(LocaleContext);
  return useCallback(
    (next: Locale) => {
      if (ctx) ctx.setLocale(next);
      else setLocale(next);
    },
    [ctx]
  );
}

export function useT() {
  const locale = useLocale();
  return useCallback((key: TranslateKey) => translate(locale, key), [locale]);
}
