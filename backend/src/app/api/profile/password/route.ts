
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updatePassword } from "@/lib/auth/update-password";
import { isPasswordValid } from "@/lib/validation/password";
import { logServerError } from "@/lib/errors/logger";

export async function PATCH(request: NextRequest) {
  try {
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

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          error:
            "Current password, new password, and confirmation password are required.",
        },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = input;

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
        {
          error:
            "New password and confirmation password do not match.",
        },
        { status: 400 }
      );
    }

    if (!isPasswordValid(newPassword)) {
      return NextResponse.json(
        {
          error:
            "New password does not meet complexity requirements.",
        },
        { status: 400 }
      );
    }

    const result = await updatePassword(
      user.email,
      currentPassword,
      newPassword
    );

    if (!result.success) {
      if (result.error === "Current password is incorrect.") {
        return NextResponse.json(
          { error: "Current password is incorrect." },
          { status: 400 }
        );
      }

      logServerError(
        new Error("PasswordUpdateFailed"),
        {
          route: "/api/profile/password",
          operation: "UPDATE_PASSWORD",
        }
      );

      return NextResponse.json(
        { error: "Password could not be updated." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    logServerError(error, {
      route: "/api/profile/password",
      operation: "PATCH_UNEXPECTED",
    });

    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
