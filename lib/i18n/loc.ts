import type { Locale } from "./index";

/** Pick EN or optional MY field; falls back to EN when MY is empty. */
export function locField(
  locale: Locale,
  en: string | null | undefined,
  my?: string | null
): string {
  if (locale === "my" && my && my.trim()) return my.trim();
  return en?.trim() ?? "";
}

/** Pick from an object with `field` and optional `fieldMy` keys. */
export function loc<T extends Record<string, unknown>>(
  locale: Locale,
  obj: T,
  field: keyof T
): string {
  const en = obj[field];
  const myKey = `${String(field)}My` as keyof T;
  const my = obj[myKey];
  if (locale === "my" && typeof my === "string" && my.trim()) return my.trim();
  return typeof en === "string" ? en : String(en ?? "");
}
