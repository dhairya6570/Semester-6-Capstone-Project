
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyAssets } from "@/lib/assets/get-my-assets";
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
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
      logServerError(
        profileError ?? new Error("MissingProfileResult"),
        {
          route: "/api/my/assets",
          operation: "PROFILE_LOOKUP",
        }
      );

      return NextResponse.json(
        { error: "User profile could not be loaded." },
        { status: 500 }
      );
    }

    if (profile.role !== "Employee") {
      return NextResponse.json(
        { error: "Employee access required." },
        { status: 403 }
      );
    }

    const result = await getMyAssets(supabase, user.id);

    if (result.error) {
      logServerError(result.error, {
        route: "/api/my/assets",
        operation: "GET_ASSIGNED_ASSETS",
      });

      return NextResponse.json(
        { error: "Assigned assets could not be loaded." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { assets: result.assets },
      { status: 200 }
    );
  } catch (error) {
    logServerError(error, {
      route: "/api/my/assets",
      operation: "GET_UNEXPECTED",
    });

    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
