
import type { SupabaseClient } from "@supabase/supabase-js";

export interface AssignAssetResult {
  assignment: {
    id: number;
    asset_id: number;
    user_id: string;
    assigned_date: string;
  } | null;
  status: number;
  error: string | null;
}

export async function assignAsset(
  supabase: SupabaseClient,
  assetId: number,
  userId: string
): Promise<AssignAssetResult> {
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

  // Only Employee profiles are eligible for assignment.
  const { data: employee, error: employeeError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .maybeSingle();

  if (employeeError) {
    return {
      assignment: null,
      status: 500,
      error: "Employee could not be verified.",
    };
  }

  if (!employee || employee.role !== "Employee") {
    return {
      assignment: null,
      status: 400,
      error: "A valid employee must be selected.",
    };
  }

  // Check whether the asset is currently assigned.
  const { data: activeAssignment, error: assignmentError } =
    await supabase
      .from("asset_assignments")
      .select("id")
      .eq("asset_id", assetId)
      .is("returned_date", null)
      .limit(1)
      .maybeSingle();

  if (assignmentError) {
    return {
      assignment: null,
      status: 500,
      error: "Asset assignment status could not be checked.",
    };
  }

  if (activeAssignment) {
    return {
      assignment: null,
      status: 409,
      error: "Asset is already assigned.",
    };
  }

  // Create the active assignment record.
  const { data: assignment, error: insertError } = await supabase
    .from("asset_assignments")
    .insert({
      asset_id: assetId,
      user_id: userId,
    })
    .select("id, asset_id, user_id, assigned_date")
    .single();

  if (insertError) {
    // The database unique index also protects against
    // simultaneous assignment requests.
    if (insertError.code === "23505") {
      return {
        assignment: null,
        status: 409,
        error: "Asset is already assigned.",
      };
    }

    return {
      assignment: null,
      status: 500,
      error: "Asset could not be assigned.",
    };
  }

  if (!assignment) {
    return {
      assignment: null,
      status: 500,
      error: "Asset could not be assigned.",
    };
  }

  return {
    assignment,
    status: 200,
    error: null,
  };
}
