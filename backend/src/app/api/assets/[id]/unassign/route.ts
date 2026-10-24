
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdministrator } from "@/lib/auth/roles";
import { unassignAsset } from "@/lib/assets/unassign-asset";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  _request: Request,
  context: RouteContext
) {
  const { id } = await context.params;
  const assetId = Number(id);

  // Validate the asset ID.
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

  // Verify authentication.
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

  // Verify administrator permissions.
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

  // Return the asset and preserve assignment history.
  const result = await unassignAsset(supabase, assetId);

  if (result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  return NextResponse.json(
    {
      message: "Asset unassigned successfully.",
      assignment: result.assignment,
    },
    { status: 200 }
  );
}
