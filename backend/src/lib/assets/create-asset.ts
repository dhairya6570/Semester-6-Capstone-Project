
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateAssetInput } from "@/lib/validation/asset";

export async function createAsset(
  supabase: SupabaseClient,
  input: CreateAssetInput
) {
  const { data: asset, error } = await supabase
    .from("assets")
    .insert({
      asset_name: input.assetName,
      asset_type: input.assetType,
      serial_number: input.serialNumber,
      purchase_date: input.purchaseDate,
    })
    .select(
      "id, asset_code, asset_name, asset_type, serial_number, purchase_date, created_at"
    )
    .single();

  if (error || !asset) {
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
