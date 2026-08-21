// Legacy Supabase admin client placeholder - migrated to Cloudflare D1 and Better Auth
export const supabaseAdmin = {
  auth: {
    admin: {
      listUsers: async () => ({ data: { users: [] }, error: null }),
      createUser: async () => ({ data: { user: null }, error: null }),
      updateUserById: async () => ({ error: null }),
      deleteUser: async () => ({ error: null }),
      inviteUserByEmail: async () => ({ data: { user: null }, error: null }),
      generateLink: async () => ({ data: { properties: { action_link: null } }, error: null }),
    },
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }), order: async () => ({ data: [], error: null }) }),
    upsert: async () => ({ error: null }),
    update: () => ({ eq: async () => ({ error: null }) }),
    delete: () => ({ eq: async () => ({ error: null }) }),
  }),
};
