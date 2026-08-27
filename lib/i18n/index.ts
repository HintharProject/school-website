import en from "@/messages/en.json";
import my from "@/messages/my.json";

export type Locale = "en" | "my";

const dictionaries: Record<Locale, Record<string, string>> = {
  en,
  my,
};

export type TranslateKey = keyof typeof en;

/**
 * Resolve a translation key for a locale. Falls back to English, then to the
 * raw key so missing translations are visible instead of crashing.
 */
export function translate(locale: Locale, key: TranslateKey): string {
  return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? String(key);
}

export const LOCALE_STORAGE_KEY = "hinthar-locale";
export const LOCALE_COOKIE = "hinthar-locale";
