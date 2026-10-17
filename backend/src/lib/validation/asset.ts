
export const ASSET_TYPES = [
  "Desktop Computer",
  "Laptop",
  "Monitor",
  "Keyboard",
  "Mouse",
  "Printer",
  "Software License",
  "Other",
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];

export interface CreateAssetInput {
  assetName: string;
  assetType: AssetType;
  serialNumber: string;
  purchaseDate: string;
}

export interface CreateAssetValidationResult {
  valid: boolean;
  error?: string;
  data?: CreateAssetInput;
}

export function validateCreateAsset(
  assetName: unknown,
  assetType: unknown,
  serialNumber: unknown,
  purchaseDate: unknown
): CreateAssetValidationResult {
  if (
    typeof assetName !== "string" ||
    typeof assetType !== "string" ||
    typeof serialNumber !== "string" ||
    typeof purchaseDate !== "string"
  ) {
    return {
      valid: false,
      error: "Asset name, type, serial number, and purchase date are required.",
    };
  }

  const trimmedName = assetName.trim();
  const trimmedSerial = serialNumber.trim();
  const trimmedDate = purchaseDate.trim();

  if (!trimmedName || !assetType.trim() || !trimmedSerial || !trimmedDate) {
    return {
      valid: false,
      error: "Asset name, type, serial number, and purchase date are required.",
    };
  }

  if (trimmedName.length > 100) {
    return {
      valid: false,
      error: "Asset name must be 100 characters or fewer.",
    };
  }

  if (trimmedSerial.length > 100) {
    return {
      valid: false,
      error: "Serial number must be 100 characters or fewer.",
    };
  }

  if (!ASSET_TYPES.includes(assetType as AssetType)) {
    return {
      valid: false,
      error: "Invalid asset type.",
    };
  }

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedDate);

  if (!dateMatch) {
    return {
      valid: false,
      error: "Purchase date must be in YYYY-MM-DD format.",
    };
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    year < 1 ||
    year > 9999 ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return {
      valid: false,
      error: "Invalid purchase date.",
    };
  }

  return {
    valid: true,
    data: {
      assetName: trimmedName,
      assetType: assetType as AssetType,
      serialNumber: trimmedSerial,
      purchaseDate: trimmedDate,
    },
  };
}
