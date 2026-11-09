
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdministrator } from "@/lib/auth/roles";
import { validateAssignAsset } from "@/lib/validation/asset-assignment";
import { assignAsset } from "@/lib/assets/assign-asset";
import { logServerError } from "@/lib/errors/logger";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const assetId = Number(id);

    if (
      !/^[1-9]\d*$/.test(id) ||
      !Number.isSafeInteger(assetId)
    ) {
      return NextResponse.json(
        { error: "Invalid asset ID." },
        { status: 400 }
      );
    }

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
          route: "/api/assets/[id]/assign",
          operation: "PROFILE_LOOKUP",
        }
      );

      return NextResponse.json(
        { error: "User profile could not be loaded." },
        { status: 500 }
      );
    }

    if (!isAdministrator(profile.role)) {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
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

    const validation = validateAssignAsset(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        {
          error:
            validation.error ??
            "Invalid asset assignment information.",
        },
        { status: 400 }
      );
    }

    const result = await assignAsset(
      supabase,
      assetId,
      validation.data.userId
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(
      {
        message: "Asset assigned successfully.",
        assignment: result.assignment,
      },
      { status: 200 }
    );
  } catch (error) {
    logServerError(error, {
      route: "/api/assets/[id]/assign",
      operation: "POST_UNEXPECTED",
    });

    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
