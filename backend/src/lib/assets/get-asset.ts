import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAsset(
  supabase: SupabaseClient,
  assetId: number
) {
  const { data: asset, error } = await supabase
    .from("assets")
    .select(
      "id, asset_code, asset_name, asset_type, serial_number, purchase_date, created_at, updated_at"
    )
    .eq("id", assetId)
    .maybeSingle();

  if (error || !asset) {
    return {
      asset: null,
      error,
    };
  }

  const { data: assignment, error: assignmentError } = await supabase
    .from("asset_assignments")
    .select("user_id, assigned_date")
    .eq("asset_id", assetId)
    .is("returned_date", null)
    .maybeSingle();

  if (assignmentError) {
    return {
      asset: null,
      error: assignmentError,
    };
  }

  return {
    asset: {
      ...asset,
      assignment_status: assignment ? "Assigned" : "Available",
      assigned_user: assignment?.user_id ?? null,
      assigned_date: assignment?.assigned_date ?? null,
    },
    error: null,
  };
}