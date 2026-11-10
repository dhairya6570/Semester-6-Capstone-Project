
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdministrator } from "@/lib/auth/roles";
import { validateCreateAsset } from "@/lib/validation/asset";
import { createAsset } from "@/lib/assets/create-asset";
import { getAssets } from "@/lib/assets/get-assets";
import { logServerError } from "@/lib/errors/logger";

export async function POST(request: Request) {
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    logServerError(profileError, {
      route: "/api/assets",
      operation: "POST_PROFILE_LOOKUP",
    });

    return NextResponse.json(
      { error: "Unable to verify administrator access." },
      { status: 500 }
    );
  }

  if (!profile || !isAdministrator(profile.role)) {
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

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const assetData = body as Record<string, unknown>;

  const validation = validateCreateAsset(
    assetData.assetName,
    assetData.assetType,
    assetData.serialNumber,
    assetData.purchaseDate
  );

  if (!validation.valid || !validation.data) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  try {
    const { asset, error } = await createAsset(
      supabase,
      validation.data
    );

    if (error || !asset) {
      if (
        error?.code === "23505" &&
        error.message.includes("serial_number")
      ) {
        return NextResponse.json(
          {
            error: "An asset with this serial number already exists.",
          },
          { status: 409 }
        );
      }

      logServerError(error, {
        route: "/api/assets",
        operation: "POST",
      });

      return NextResponse.json(
        { error: "Asset could not be created." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { asset },
      { status: 201 }
    );
  } catch (error) {
    logServerError(error, {
      route: "/api/assets",
      operation: "POST",
    });

    return NextResponse.json(
      { error: "Asset could not be created." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    logServerError(profileError, {
      route: "/api/assets",
      operation: "GET_PROFILE_LOOKUP",
    });

    return NextResponse.json(
      { error: "Unable to verify administrator access." },
      { status: 500 }
    );
  }

  if (!profile || !isAdministrator(profile.role)) {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 }
    );
  }

  // Week 9 - F5.4: Asset assignment status filtering
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  if (
    status !== null &&
    status !== "Assigned" &&
    status !== "Available"
  ) {
    return NextResponse.json(
      { error: "Invalid asset assignment status filter." },
      { status: 400 }
    );
  }

  try {
    const { assets, error } = await getAssets(
      supabase,
      status ?? undefined
    );

    if (error) {
      logServerError(error, {
        route: "/api/assets",
        operation: "GET",
      });

      return NextResponse.json(
        { error: "Assets could not be retrieved." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { assets },
      { status: 200 }
    );
  } catch (error) {
    logServerError(error, {
      route: "/api/assets",
      operation: "GET",
    });

    return NextResponse.json(
      { error: "Assets could not be retrieved." },
      { status: 500 }
    );
  }
}
