
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

export interface UpdateAssetInput {
  assetName?: string;
  assetType?: AssetType;
  purchaseDate?: string;
}

export interface UpdateAssetValidationResult {
  valid: boolean;
  error?: string;
  data?: UpdateAssetInput;
}

export function validateUpdateAsset(
  body: unknown
): UpdateAssetValidationResult {
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return {
      valid: false,
      error: "Invalid request body.",
    };
  }

  const input = body as Record<string, unknown>;
  const allowedFields = [
    "assetName",
    "assetType",
    "purchaseDate",
  ];

  const fields = Object.keys(input);

  if (fields.length === 0) {
    return {
      valid: false,
      error: "At least one asset field is required.",
    };
  }

  for (const field of fields) {
    if (!allowedFields.includes(field)) {
      return {
        valid: false,
        error: `Field '${field}' cannot be updated.`,
      };
    }
  }

  const data: UpdateAssetInput = {};

  if ("assetName" in input) {
    if (typeof input.assetName !== "string") {
      return {
        valid: false,
        error: "Invalid asset name.",
      };
    }

    const name = input.assetName.trim();

    if (!name || name.length > 100) {
      return {
        valid: false,
        error: "Asset name must be between 1 and 100 characters.",
      };
    }

    data.assetName = name;
  }

  if ("assetType" in input) {
    if (
      typeof input.assetType !== "string" ||
      !ASSET_TYPES.includes(input.assetType as AssetType)
    ) {
      return {
        valid: false,
        error: "Invalid asset type.",
      };
    }

    data.assetType = input.assetType as AssetType;
  }

  if ("purchaseDate" in input) {
    if (typeof input.purchaseDate !== "string") {
      return {
        valid: false,
        error: "Invalid purchase date.",
      };
    }

    const dateString = input.purchaseDate.trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

    if (!match) {
      return {
        valid: false,
        error: "Purchase date must be in YYYY-MM-DD format.",
      };
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

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

    data.purchaseDate = dateString;
  }

  return {
    valid: true,
    data,
  };
}