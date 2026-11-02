"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LOCALE_COOKIE, LOCALE_STORAGE_KEY, type Locale } from "./index";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
      document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
      document.documentElement.lang = next;
      document.documentElement.dataset.locale = next;
    } catch {
      // non-fatal
    }
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleContext() {
  return useContext(LocaleContext);
}

