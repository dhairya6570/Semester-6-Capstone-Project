
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdministrator } from "@/lib/auth/roles";
import { getAsset } from "@/lib/assets/get-asset";
import { updateAsset } from "@/lib/assets/update-asset";
import { validateUpdateAsset } from "@/lib/validation/asset";
import { deleteAsset } from "@/lib/assets/delete-asset";
import { logServerError } from "@/lib/errors/logger";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

function validateAssetId(id: string): number | null {
  const assetId = Number(id);

  if (
    !/^[1-9]\d*$/.test(id) ||
    !Number.isSafeInteger(assetId)
  ) {
    return null;
  }

  return assetId;
}

async function authorizeAdministrator() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      supabase,
      errorResponse: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      ),
    };
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
        route: "/api/assets/[id]",
        operation: "PROFILE_LOOKUP",
      }
    );

    return {
      supabase,
      errorResponse: NextResponse.json(
        { error: "User profile could not be loaded." },
        { status: 500 }
      ),
    };
  }

  if (!isAdministrator(profile.role)) {
    return {
      supabase,
      errorResponse: NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      ),
    };
  }

  return { supabase, errorResponse: null };
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const assetId = validateAssetId(id);

    if (assetId === null) {
      return NextResponse.json(
        { error: "Invalid asset ID." },
        { status: 400 }
      );
    }

    const { supabase, errorResponse } =
      await authorizeAdministrator();

    if (errorResponse) {
      return errorResponse;
    }

    const { asset, error } = await getAsset(
      supabase,
      assetId
    );

    if (error) {
      logServerError(error, {
        route: "/api/assets/[id]",
        operation: "GET_ASSET",
      });

      return NextResponse.json(
        { error: "Asset could not be loaded." },
        { status: 500 }
      );
    }

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { asset },
      { status: 200 }
    );
  } catch (error) {
    logServerError(error, {
      route: "/api/assets/[id]",
      operation: "GET_UNEXPECTED",
    });

    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const assetId = validateAssetId(id);

    if (assetId === null) {
      return NextResponse.json(
        { error: "Invalid asset ID." },
        { status: 400 }
      );
    }

    const { supabase, errorResponse } =
      await authorizeAdministrator();

    if (errorResponse) {
      return errorResponse;
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

    const validation = validateUpdateAsset(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        {
          error:
            validation.error ?? "Invalid asset information.",
        },
        { status: 400 }
      );
    }

    const { asset, error } = await updateAsset(
      supabase,
      assetId,
      validation.data
    );

    if (error) {
      logServerError(error, {
        route: "/api/assets/[id]",
        operation: "UPDATE_ASSET",
      });

      return NextResponse.json(
        { error: "Asset could not be updated." },
        { status: 500 }
      );
    }

    if (!asset) {
      return NextResponse.json(
        { error: "Asset not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Asset updated successfully.",
      asset,
    });
  } catch (error) {
    logServerError(error, {
      route: "/api/assets/[id]",
      operation: "PATCH_UNEXPECTED",
    });

    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const assetId = validateAssetId(id);

    if (assetId === null) {
      return NextResponse.json(
        { error: "Invalid asset ID." },
        { status: 400 }
      );
    }

    const { supabase, errorResponse } =
      await authorizeAdministrator();

    if (errorResponse) {
      return errorResponse;
    }

    const result = await deleteAsset(
      supabase,
      assetId
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(
      { message: "Asset deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    logServerError(error, {
      route: "/api/assets/[id]",
      operation: "DELETE_UNEXPECTED",
    });

    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
