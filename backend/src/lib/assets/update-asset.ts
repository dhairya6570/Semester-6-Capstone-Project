import type { SupabaseClient } from "@supabase/supabase-js";
import type { UpdateAssetInput } from "@/lib/validation/asset";

export async function updateAsset(
  supabase: SupabaseClient,
  assetId: number,
  input: UpdateAssetInput
) {
  const updates: Record<string, string> = {};

  if (input.assetName !== undefined) {
    updates.asset_name = input.assetName;
  }

  if (input.assetType !== undefined) {
    updates.asset_type = input.assetType;
  }

  if (input.purchaseDate !== undefined) {
    updates.purchase_date = input.purchaseDate;
  }

  const { data: asset, error } = await supabase
    .from("assets")
    .update(updates)
    .eq("id", assetId)
    .select(
      "id, asset_code, asset_name, asset_type, serial_number, purchase_date, created_at, updated_at"
    )
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