import type { SupabaseClient } from "@supabase/supabase-js";

export async function getMyAssets(
  supabase: SupabaseClient,
  userId: string
) {
  const { data: assignments, error } = await supabase
    .from("asset_assignments")
    .select(`
      id,
      assigned_date,
      assets (
        id,
        asset_code,
        asset_name,
        asset_type,
        serial_number,
        purchase_date
      )
    `)
    .eq("user_id", userId)
    .is("returned_date", null)
    .order("assigned_date", { ascending: false });

  if (error) {
    return {
      assets: null,
      error,
    };
  }

  const assets = (assignments ?? [])
    .filter((assignment) => assignment.assets !== null)
    .map((assignment) => ({
      ...assignment.assets,
      assignment_id: assignment.id,
      assigned_date: assignment.assigned_date,
      assignment_status: "Assigned",
    }));

  return {
    assets,
    error: null,
  };
}