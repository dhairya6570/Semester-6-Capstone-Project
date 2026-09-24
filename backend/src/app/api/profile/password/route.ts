import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updatePassword } from "@/lib/auth/update-password";
import { isPasswordValid } from "@/lib/validation/password";

export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || !user.email) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const { currentPassword, newPassword, confirmPassword } = body;

  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    typeof confirmPassword !== "string" ||
    !currentPassword ||
    !newPassword ||
    !confirmPassword
  ) {
    return NextResponse.json(
      {
        error:
          "Current password, new password, and confirmation password are required.",
      },
      { status: 400 }
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { error: "New password and confirmation password do not match." },
      { status: 400 }
    );
  }

  if (!isPasswordValid(newPassword)) {
    return NextResponse.json(
      { error: "New password does not meet complexity requirements." },
      { status: 400 }
    );
  }

  const result = await updatePassword(
    user.email,
    currentPassword,
    newPassword
  );

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: "Password updated successfully." },
    { status: 200 }
  );
}