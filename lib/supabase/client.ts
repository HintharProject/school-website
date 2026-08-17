import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ytmylxemqrsjxdvrthxx.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseAnonKey &&
  supabaseAnonKey !== "your_supabase_anon_key_here" &&
  supabaseAnonKey.length > 10
);

let browserClientInstance: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClientInstance) {
    browserClientInstance = createBrowserClient(
      supabaseUrl,
      supabaseAnonKey || "mock-anon-key-placeholder"
    );
  }
  return browserClientInstance;
}

export const supabase = getSupabaseBrowserClient();
