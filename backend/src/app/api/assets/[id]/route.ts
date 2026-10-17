import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdministrator } from "@/lib/auth/roles";
import { getAsset } from "@/lib/assets/get-asset";
import { updateAsset } from "@/lib/assets/update-asset";
import { validateUpdateAsset } from "@/lib/validation/asset";
import { deleteAsset } from "@/lib/assets/delete-asset";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !isAdministrator(profile.role)
  ) {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 }
    );
  }

  const { asset, error } = await getAsset(
    supabase,
    assetId
  );

  if (error) {
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
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !isAdministrator(profile.role)
  ) {
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

  const validation = validateUpdateAsset(body);

  if (!validation.valid || !validation.data) {
    return NextResponse.json(
      { error: validation.error ?? "Invalid asset information." },
      { status: 400 }
    );
  }

  const { asset, error } = await updateAsset(
    supabase,
    assetId,
    validation.data
  );

  if (error) {
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
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !isAdministrator(profile.role)
  ) {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 }
    );
  }

  const result = await deleteAsset(supabase, assetId);

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
}