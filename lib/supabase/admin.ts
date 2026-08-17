import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ytmylxemqrsjxdvrthxx.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!serviceRoleKey && process.env.NODE_ENV === "production") {
  console.warn("WARNING: SUPABASE_SERVICE_ROLE_KEY is not defined in the server environment.");
}

/**
 * Server-only Supabase admin client with service_role privileges.
 * NEVER expose this to the browser or include in client-side code.
 * Use only in Next.js backend API routes (app/api/** /route.ts).
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey || "missing-service-role-key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

