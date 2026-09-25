import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface UpdatePasswordResult {
  success: boolean;
  error: string | null;
}

export async function updatePassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<UpdatePasswordResult> {
  const supabase = await createSupabaseServerClient();

  const { error: verificationError } =
    await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

  if (verificationError) {
    return {
      success: false,
      error: "Current password is incorrect.",
    };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return {
      success: false,
      error: "Password could not be updated.",
    };
  }

  return {
    success: true,
    error: null,
  };
}