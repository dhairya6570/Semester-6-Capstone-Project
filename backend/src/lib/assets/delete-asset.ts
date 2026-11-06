
import type { SupabaseClient } from "@supabase/supabase-js";
import { logServerError } from "@/lib/errors/logger";

export async function deleteAsset(
  supabase: SupabaseClient,
  assetId: number
) {
  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .select("id")
    .eq("id", assetId)
    .maybeSingle();

  if (assetError) {
    logServerError(assetError, {
      route: "/api/assets/[id]",
      operation: "DELETE_ASSET_LOOKUP",
    });

    return { status: 500, error: "Asset could not be loaded." };
  }

  if (!asset) {
    return { status: 404, error: "Asset not found." };
  }

  const { data: activeAssignment, error: assignmentError } =
    await supabase
      .from("asset_assignments")
      .select("id")
      .eq("asset_id", assetId)
      .is("returned_date", null)
      .limit(1)
      .maybeSingle();

  if (assignmentError) {
    logServerError(assignmentError, {
      route: "/api/assets/[id]",
      operation: "DELETE_ASSIGNMENT_LOOKUP",
    });

    return {
      status: 500,
      error: "Asset assignment could not be checked.",
    };
  }

  if (activeAssignment) {
    return {
      status: 400,
      error: "Cannot delete an asset that is currently assigned.",
    };
  }

  const { data: deletedAsset, error: deleteError } = await supabase
    .from("assets")
    .delete()
    .eq("id", assetId)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    if (deleteError.code === "23503") {
      return {
        status: 409,
        error: "Cannot delete an asset with assignment history.",
      };
    }

    logServerError(deleteError, {
      route: "/api/assets/[id]",
      operation: "DELETE",
    });

    return {
      status: 500,
      error: "Asset could not be deleted.",
    };
  }

  if (!deletedAsset) {
    return { status: 404, error: "Asset not found." };
  }

  return { status: 200, error: null };
}
