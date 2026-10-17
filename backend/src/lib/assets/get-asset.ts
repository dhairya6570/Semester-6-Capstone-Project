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

  if (error) {
    return {
      asset: null,
      error,
    };
  }

  return {
    asset,
    error: null,
  };
}