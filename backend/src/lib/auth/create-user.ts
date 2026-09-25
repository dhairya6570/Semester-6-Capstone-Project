import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CreateUserInput } from "@/lib/validation/create-user";

export async function createUserAccount(input: CreateUserInput) {
  const supabaseAdmin = createSupabaseAdminClient();

  const { data, error } =
    await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
      },
    });

  if (error || !data.user) {
    return {
      user: null,
      error,
    };
  }

  if (input.role === "Administrator") {
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        role: "Administrator",
      })
      .eq("id", data.user.id);

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);

      return {
        user: null,
        error: profileError,
      };
    }
  }

  return {
    user: data.user,
    error: null,
  };
}