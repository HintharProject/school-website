import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ytmylxemqrsjxdvrthxx.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY is required in environment variables to run this seed script.");
  console.error("Usage: SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-principal.mjs");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("Checking Supabase connection & provisioning Principal account...");

  const principalEmail = process.env.PRINCIPAL_EMAIL || "kaungmyat.htut@gmail.com";
  const principalPassword = process.env.PRINCIPAL_INITIAL_PASSWORD || "Kmh132546$";

  // 1. List users to see if principal exists
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();

  if (listErr) {
    console.error("Error listing users:", listErr);
    return;
  }

  let principalUser = users.find((u) => u.email?.toLowerCase() === principalEmail.toLowerCase());

  if (!principalUser) {
    console.log(`Creating user in Supabase Auth: ${principalEmail}...`);
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email: principalEmail,
      password: principalPassword,
      email_confirm: true,
      user_metadata: {
        full_name: "Dr. Kaung Myat Htut",
        title: "Principal & Founder",
      },
      app_metadata: {
        role: "principal",
      },
    });

    if (createErr) {
      console.error("Failed to create user:", createErr);
      return;
    }
    principalUser = newUser.user;
    console.log("Created Supabase Auth user:", principalUser.id);
  } else {
    console.log("Supabase Auth user already exists:", principalUser.id);
    // Update password to ensure it matches Kmh132546$
    const { error: updateErr } = await supabase.auth.admin.updateUserById(principalUser.id, {
      password: principalPassword,
      email_confirm: true,
      user_metadata: {
        full_name: "Dr. Kaung Myat Htut",
        title: "Principal & Founder",
      },
      app_metadata: {
        role: "principal",
      },
    });
    if (updateErr) {
      console.error("Failed to update password/metadata:", updateErr);
    } else {
      console.log("Updated password and metadata successfully.");
    }
  }

  // 2. Check or upsert user_profiles record in public schema
  console.log("Ensuring user_profiles entry exists...");
  const { data: profile, error: profileErr } = await supabase
    .from("user_profiles")
    .upsert({
      id: principalUser.id,
      email: principalEmail,
      full_name: "Dr. Kaung Myat Htut",
      role: "principal",
      title: "Principal & Founder",
      campus_id: "ywarma-campus",
      status: "active",
    })
    .select();

  if (profileErr) {
    console.log("Note on user_profiles upsert:", profileErr.message);
    console.log("(If table doesn't exist yet, apply supabase/schema.sql in Supabase SQL editor)");
  } else {
    console.log("Upserted user_profiles record successfully:", profile);
  }

  console.log("Principal seeding completed!");
}

main().catch(console.error);
