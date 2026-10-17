import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdministrator } from "@/lib/auth/roles";
import { getAsset } from "@/lib/assets/get-asset";

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