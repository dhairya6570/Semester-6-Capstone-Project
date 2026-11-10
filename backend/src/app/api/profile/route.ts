
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logServerError } from "@/lib/errors/logger";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("id, full_name, role, created_at")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
      logServerError(
        profileError ?? new Error("MissingProfileResult"),
        {
          route: "/api/profile",
          operation: "GET_PROFILE",
        }
      );

      return NextResponse.json(
        { error: "User profile could not be loaded." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        fullName: profile.full_name,
        email: user.email,
        role: profile.role,
        createdAt: profile.created_at,
      },
    });
  } catch (error) {
    logServerError(error, {
      route: "/api/profile",
      operation: "GET_UNEXPECTED",
    });

    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
