import { cookies } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "./index";

/** Reads the user's preferred locale from the request cookie during SSR. */
export async function getServerLocale(): Promise<Locale> {
  try {
    const store = await cookies();
    const raw = store.get(LOCALE_COOKIE)?.value;
    if (raw === "my" || raw === "en") return raw;
  } catch {
    // Fallback during static generation or non-request contexts
  }
  return "en";
}

