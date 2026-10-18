
import { API_URL } from "@/lib/api/config";

export type AssetAssignmentStatus = "Available" | "Assigned";

export interface Asset {
  id: number;
  asset_code: string;
  asset_name: string;
  asset_type: string;
  serial_number: string;
  purchase_date: string | null;
  created_at: string;
  updated_at?: string;
  assignment_status?: AssetAssignmentStatus;
  assigned_user?: string | null;
  assigned_date?: string | null;
}

export interface CreateAssetInput {
  assetName: string;
  assetType: string;
  serialNumber: string;
  purchaseDate: string | null;
}

export interface UpdateAssetInput {
  assetName: string;
  assetType: string;
  purchaseDate: string | null;
}

export async function getAssets(): Promise<Asset[]> {
  const response = await fetch(`${API_URL}/api/assets`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Unable to load assets."
    );
  }

  return data.assets;
}

export async function getAsset(
  id: number
): Promise<Asset> {
  const response = await fetch(
    `${API_URL}/api/assets/${id}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Unable to load asset."
    );
  }

  return data.asset;
}

export async function createAsset(
  input: CreateAssetInput
): Promise<Asset> {
  const response = await fetch(`${API_URL}/api/assets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Unable to create asset."
    );
  }

  return data.asset;
}

export async function updateAsset(
  id: number,
  input: UpdateAssetInput
): Promise<Asset> {
  const response = await fetch(
    `${API_URL}/api/assets/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(input),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Unable to update asset."
    );
  }

  return data.asset;
}

export async function deleteAsset(id: number): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/assets/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Unable to delete asset."
    );
  }
}