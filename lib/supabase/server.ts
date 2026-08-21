// Legacy Supabase server client placeholder - migrated to Cloudflare D1 and Better Auth
export const isSupabaseConfigured = false;

export async function createSupabaseServerClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
  };
}
