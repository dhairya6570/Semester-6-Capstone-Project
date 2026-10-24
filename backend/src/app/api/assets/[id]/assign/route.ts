
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdministrator } from "@/lib/auth/roles";
import { validateAssignAsset } from "@/lib/validation/asset-assignment";
import { assignAsset } from "@/lib/assets/assign-asset";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: Request,
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

  // Verify that the requester is authenticated.
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

  // Read the request body.
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  // Validate the employee UUID.
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

  // Assign the asset using the tested service.
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
}
