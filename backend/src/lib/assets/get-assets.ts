import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAssets(
  supabase: SupabaseClient
) {
  const { data: assets, error } = await supabase
    .from("assets")
    .select(`
      id,
      asset_code,
      asset_name,
      asset_type,
      serial_number,
      purchase_date,
      created_at,
      updated_at,
      asset_assignments (
        id,
        returned_date
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      assets: null,
      error,
    };
  }

  const assetsWithStatus = (assets ?? []).map((asset) => {
    const isAssigned = asset.asset_assignments.some(
      (assignment) => assignment.returned_date === null
    );

    return {
      id: asset.id,
      asset_code: asset.asset_code,
      asset_name: asset.asset_name,
      asset_type: asset.asset_type,
      serial_number: asset.serial_number,
      purchase_date: asset.purchase_date,
      created_at: asset.created_at,
      updated_at: asset.updated_at,
      assignment_status: isAssigned ? "Assigned" : "Available",
    };
  });

  return {
    assets: assetsWithStatus,
    error: null,
  };
}