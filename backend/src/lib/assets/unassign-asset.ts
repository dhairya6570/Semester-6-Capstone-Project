
import type { SupabaseClient } from "@supabase/supabase-js";
import { logServerError } from "@/lib/errors/logger";

export interface UnassignAssetResult {
  assignment: {
    id: number;
    asset_id: number;
    user_id: string;
    assigned_date: string;
    returned_date: string;
  } | null;
  status: number;
  error: string | null;
}

export async function unassignAsset(
  supabase: SupabaseClient,
  assetId: number
): Promise<UnassignAssetResult> {
  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .select("id")
    .eq("id", assetId)
    .maybeSingle();

  if (assetError) {
    logServerError(assetError, {
      route: "/api/assets/[id]/unassign",
      operation: "ASSET_LOOKUP",
    });

    return {
      assignment: null,
      status: 500,
      error: "Asset could not be loaded.",
    };
  }

  if (!asset) {
    return {
      assignment: null,
      status: 404,
      error: "Asset not found.",
    };
  }

  const { data: activeAssignment, error: lookupError } =
    await supabase
      .from("asset_assignments")
      .select("id")
      .eq("asset_id", assetId)
      .is("returned_date", null)
      .maybeSingle();

  if (lookupError) {
    logServerError(lookupError, {
      route: "/api/assets/[id]/unassign",
      operation: "ASSIGNMENT_LOOKUP",
    });

    return {
      assignment: null,
      status: 500,
      error: "Asset assignment could not be loaded.",
    };
  }

  if (!activeAssignment) {
    return {
      assignment: null,
      status: 409,
      error: "Asset is not currently assigned.",
    };
  }

  const returnedDate = new Date().toISOString().slice(0, 10);

  const { data: assignment, error: updateError } =
    await supabase
      .from("asset_assignments")
      .update({
        returned_date: returnedDate,
      })
      .eq("id", activeAssignment.id)
      .is("returned_date", null)
      .select(
        "id, asset_id, user_id, assigned_date, returned_date"
      )
      .maybeSingle();

  if (updateError) {
    logServerError(updateError, {
      route: "/api/assets/[id]/unassign",
      operation: "ASSIGNMENT_UPDATE",
    });

    return {
      assignment: null,
      status: 500,
      error: "Asset could not be unassigned.",
    };
  }

  if (!assignment) {
    return {
      assignment: null,
      status: 409,
      error: "Asset is not currently assigned.",
    };
  }

  return {
    assignment,
    status: 200,
    error: null,
  };
}
