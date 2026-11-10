
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logServerError } from "@/lib/errors/logger";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "No authenticated session.",
        },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError) {
      logServerError(profileError, {
        route: "/api/auth/session",
        operation: "SESSION_PROFILE_LOOKUP",
      });

      return NextResponse.json(
        {
          authenticated: false,
          error: "User profile could not be loaded.",
        },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "User profile could not be loaded.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: profile.role,
      },
    });
  } catch (error) {
    logServerError(error, {
      route: "/api/auth/session",
      operation: "SESSION_UNEXPECTED",
    });

    return NextResponse.json(
      {
        authenticated: false,
        error: "An unexpected server error occurred.",
      },
      { status: 500 }
    );
  }
}
