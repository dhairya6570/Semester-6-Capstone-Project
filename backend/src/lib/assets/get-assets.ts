import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAssets(
  supabase: SupabaseClient
) {
  const { data: assets, error } = await supabase
    .from("assets")
    .select(
      "id, asset_code, asset_name, asset_type, serial_number, purchase_date, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return {
      assets: null,
      error,
    };
  }

  return {
    assets,
    error: null,
  };
}