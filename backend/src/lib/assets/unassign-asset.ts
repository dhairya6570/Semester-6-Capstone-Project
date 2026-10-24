
import type { SupabaseClient } from "@supabase/supabase-js";

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
  // Verify that the asset exists.
  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .select("id")
    .eq("id", assetId)
    .maybeSingle();

  if (assetError) {
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

  // Find the active assignment.
  const { data: activeAssignment, error: lookupError } =
    await supabase
      .from("asset_assignments")
      .select("id")
      .eq("asset_id", assetId)
      .is("returned_date", null)
      .maybeSingle();

  if (lookupError) {
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

  // Use today's date for the return.
  const returnedDate = new Date().toISOString().slice(0, 10);

  // Close only the active assignment.
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
    return {
      assignment: null,
      status: 500,
      error: "Asset could not be unassigned.",
    };
  }

  // Another request may have returned the asset first.
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
