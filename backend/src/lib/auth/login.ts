import { createSupabaseClient } from "@/lib/supabase/client";

export async function loginUser(email: string, password: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      user: null,
      session: null,
      error: error.message,
    };
  }

  return {
    user: data.user,
    session: data.session,
    error: null,
  };
}