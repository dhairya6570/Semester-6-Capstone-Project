import { createClient } from "@supabase/supabase-js";

function getSupabaseConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL environment variable");
  }

  if (!supabasePublishableKey) {
    throw new Error("Missing SUPABASE_PUBLISHABLE_KEY environment variable");
  }

  return {
    supabaseUrl,
    supabasePublishableKey,
  };
}

export function createSupabaseClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig();

  return createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}