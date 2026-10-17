
import { describe, expect, jest, test } from "@jest/globals";
import type { SupabaseClient } from "@supabase/supabase-js";
import { validateCreateAsset, validateUpdateAsset } from "../asset";
import { createAsset } from "@/lib/assets/create-asset";
import { getAsset } from "@/lib/assets/get-asset";

describe("Asset validation", () => {
  test("accepts valid asset information", () => {
    const result = validateCreateAsset(
      "Dell Latitude 5540",
      "Laptop",
      "DL-2026-001",
      "2026-10-15"
    );

    expect(result.valid).toBe(true);
    expect(result.data).toEqual({
      assetName: "Dell Latitude 5540",
      assetType: "Laptop",
      serialNumber: "DL-2026-001",
      purchaseDate: "2026-10-15",
    });
  });

  test("rejects an empty asset name", () => {
    const result = validateCreateAsset(
      "   ",
      "Laptop",
      "DL-2026-001",
      "2026-10-15"
    );

    expect(result.valid).toBe(false);
  });

  test("accepts an asset name at exactly 100 characters", () => {
    const result = validateCreateAsset(
      "A".repeat(100),
      "Laptop",
      "DL-2026-001",
      "2026-10-15"
    );

    expect(result.valid).toBe(true);
  });

  test("rejects an asset name exceeding 100 characters", () => {
    const result = validateCreateAsset(
      "A".repeat(101),
      "Laptop",
      "DL-2026-001",
      "2026-10-15"
    );

    expect(result.valid).toBe(false);
  });

  test("accepts all eight predefined asset types", () => {
    const types = [
      "Desktop Computer",
      "Laptop",
      "Monitor",
      "Keyboard",
      "Mouse",
      "Printer",
      "Software License",
      "Other",
    ];

    for (const type of types) {
      const result = validateCreateAsset(
        "Test Asset",
        type,
        "TEST-001",
        "2026-10-15"
      );

      expect(result.valid).toBe(true);
    }
  });

  test("rejects an invalid asset type", () => {
    const result = validateCreateAsset(
      "Dell Laptop",
      "Smartphone",
      "DL-2026-001",
      "2026-10-15"
    );

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid asset type.");
  });

  test("rejects an empty serial number", () => {
    const result = validateCreateAsset(
      "Dell Laptop",
      "Laptop",
      "   ",
      "2026-10-15"
    );

    expect(result.valid).toBe(false);
  });

  test("rejects a serial number exceeding 100 characters", () => {
    const result = validateCreateAsset(
      "Dell Laptop",
      "Laptop",
      "S".repeat(101),
      "2026-10-15"
    );

    expect(result.valid).toBe(false);
  });

  test("accepts a serial number at exactly 100 characters", () => {
    const result = validateCreateAsset(
      "Dell Laptop",
      "Laptop",
      "S".repeat(100),
      "2026-10-15"
    );

    expect(result.valid).toBe(true);
  });

  test("rejects an incorrectly formatted purchase date", () => {
    const result = validateCreateAsset(
      "Dell Laptop",
      "Laptop",
      "DL-2026-001",
      "15/10/2026"
    );

    expect(result.valid).toBe(false);
  });

  test("rejects an impossible purchase date", () => {
    const result = validateCreateAsset(
      "Dell Laptop",
      "Laptop",
      "DL-2026-001",
      "2026-02-30"
    );

    expect(result.valid).toBe(false);
  });

  test("accepts a valid leap-year date", () => {
    const result = validateCreateAsset(
      "Dell Laptop",
      "Laptop",
      "DL-2026-001",
      "2024-02-29"
    );

    expect(result.valid).toBe(true);
  });

  test("rejects February 29 in a non-leap year", () => {
    const result = validateCreateAsset(
      "Dell Laptop",
      "Laptop",
      "DL-2026-001",
      "2026-02-29"
    );

    expect(result.valid).toBe(false);
  });

  test("rejects missing required fields", () => {
    const result = validateCreateAsset(
      undefined,
      "Laptop",
      "DL-2026-001",
      "2026-10-15"
    );

    expect(result.valid).toBe(false);
  });

  test("trims whitespace from asset name and serial number", () => {
    const result = validateCreateAsset(
      "  Dell Laptop  ",
      "Laptop",
      "  DL-2026-001  ",
      "2026-10-15"
    );

    expect(result.valid).toBe(true);
    expect(result.data?.assetName).toBe("Dell Laptop");
    expect(result.data?.serialNumber).toBe("DL-2026-001");
  });
});

describe("Update asset validation", () => {
  test("accepts an asset name update", () => {
    const result = validateUpdateAsset({
      assetName: "HP EliteBook",
    });

    expect(result.valid).toBe(true);
    expect(result.data).toEqual({
      assetName: "HP EliteBook",
    });
  });

  test("accepts an asset type update", () => {
    const result = validateUpdateAsset({
      assetType: "Monitor",
    });

    expect(result.valid).toBe(true);
    expect(result.data).toEqual({
      assetType: "Monitor",
    });
  });

  test("accepts a purchase date update", () => {
    const result = validateUpdateAsset({
      purchaseDate: "2026-10-15",
    });

    expect(result.valid).toBe(true);
    expect(result.data).toEqual({
      purchaseDate: "2026-10-15",
    });
  });

  test("accepts multiple valid fields", () => {
    const result = validateUpdateAsset({
      assetName: "Dell Monitor",
      assetType: "Monitor",
      purchaseDate: "2026-10-16",
    });

    expect(result.valid).toBe(true);
    expect(result.data).toEqual({
      assetName: "Dell Monitor",
      assetType: "Monitor",
      purchaseDate: "2026-10-16",
    });
  });

  test("trims whitespace from asset name", () => {
    const result = validateUpdateAsset({
      assetName: "  Dell Laptop  ",
    });

    expect(result.valid).toBe(true);
    expect(result.data?.assetName).toBe("Dell Laptop");
  });

  test("rejects an empty update", () => {
    const result = validateUpdateAsset({});

    expect(result.valid).toBe(false);
  });

  test("rejects an empty asset name", () => {
    const result = validateUpdateAsset({
      assetName: "   ",
    });

    expect(result.valid).toBe(false);
  });

  test("rejects an asset name exceeding 100 characters", () => {
    const result = validateUpdateAsset({
      assetName: "A".repeat(101),
    });

    expect(result.valid).toBe(false);
  });

  test("rejects an invalid asset type", () => {
    const result = validateUpdateAsset({
      assetType: "Smartphone",
    });

    expect(result.valid).toBe(false);
  });

  test("rejects an impossible purchase date", () => {
    const result = validateUpdateAsset({
      purchaseDate: "2026-02-30",
    });

    expect(result.valid).toBe(false);
  });

  test("rejects an incorrectly formatted purchase date", () => {
    const result = validateUpdateAsset({
      purchaseDate: "15/10/2026",
    });

    expect(result.valid).toBe(false);
  });

  test("rejects serial number updates", () => {
    const result = validateUpdateAsset({
      serialNumber: "NEW-123",
    });

    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      "Field 'serialNumber' cannot be updated."
    );
  });

  test("rejects asset code updates", () => {
    const result = validateUpdateAsset({
      assetCode: "AST-9999",
    });

    expect(result.valid).toBe(false);
  });

  test("rejects unknown fields", () => {
    const result = validateUpdateAsset({
      status: "Active",
    });

    expect(result.valid).toBe(false);
  });

  test("rejects invalid request bodies", () => {
    expect(validateUpdateAsset(null).valid).toBe(false);
    expect(validateUpdateAsset([]).valid).toBe(false);
    expect(validateUpdateAsset("invalid").valid).toBe(false);
  });

  test("rejects an invalid field type", () => {
    const result = validateUpdateAsset({
      assetName: 123,
    });

    expect(result.valid).toBe(false);
  });
});

describe("Asset creation service", () => {
  test("UT-12: application leaves asset ID generation to the database", async () => {
    const single = jest.fn(async () => ({
      data: {
        id: 10,
        asset_code: "AST-0010",
        asset_name: "Dell Laptop",
        asset_type: "Laptop",
        serial_number: "TEST-UT12-001",
        purchase_date: "2026-10-15",
      },
      error: null,
    }));

    const select = jest.fn(() => ({ single }));
    const insert = jest.fn<(values: Record<string, unknown>) => { select: typeof select }>(
        () => ({ select })
    );
    const from = jest.fn<(table: string) => { insert: typeof insert }>(
        () => ({ insert })
    );

    const supabase = { from } as unknown as SupabaseClient;

    const result = await createAsset(supabase, {
      assetName: "Dell Laptop",
      assetType: "Laptop",
      serialNumber: "TEST-UT12-001",
      purchaseDate: "2026-10-15",
    });

    expect(from).toHaveBeenCalledWith("assets");

    expect(insert).toHaveBeenCalledWith({
      asset_name: "Dell Laptop",
      asset_type: "Laptop",
      serial_number: "TEST-UT12-001",
      purchase_date: "2026-10-15",
    });

    expect(result.asset?.id).toBe(10);
    expect(result.asset?.asset_code).toBe("AST-0010");
    expect(result.error).toBeNull();
  });

  test("UT-14: duplicate serial number returns a database error", async () => {
    const duplicateError = {
      code: "23505",
      message: "duplicate key value violates unique constraint",
      details: "Key (serial_number) already exists.",
      hint: "",
    };

    const single = jest.fn(async () => ({
      data: null,
      error: duplicateError,
    }));

    const select = jest.fn(() => ({ single }));

    const insert = jest.fn<
      (values: Record<string, unknown>) => { select: typeof select }
    >(() => ({ select }));

    const from = jest.fn<
      (table: string) => { insert: typeof insert }
    >(() => ({ insert }));

    const supabase = { from } as unknown as SupabaseClient;

    const result = await createAsset(supabase, {
      assetName: "Another Dell Laptop",
      assetType: "Laptop",
      serialNumber: "DUPLICATE-001",
      purchaseDate: "2026-10-15",
    });

    expect(from).toHaveBeenCalledWith("assets");
    expect(result.asset).toBeNull();
    expect(result.error?.code).toBe("23505");
  });
});


describe("Asset assignment status", () => {
  test("UT-11: new asset without an assignment is Available", async () => {
    const asset = {
      id: 10,
      asset_code: "AST-0010",
      asset_name: "Dell Laptop",
      asset_type: "Laptop",
      serial_number: "TEST-UT11-001",
      purchase_date: "2026-10-15",
    };

    const assetMaybeSingle = jest.fn(async () => ({
      data: asset,
      error: null,
    }));

    const assignmentMaybeSingle = jest.fn(async () => ({
      data: null,
      error: null,
    }));

    const assetEq = jest.fn(() => ({
      maybeSingle: assetMaybeSingle,
    }));

    const assignmentIs = jest.fn<
      (column: string, value: null) => {
        maybeSingle: typeof assignmentMaybeSingle;
      }
    >(() => ({
      maybeSingle: assignmentMaybeSingle,
    }));

    const assignmentEq = jest.fn<
      (column: string, value: number) => {
        is: typeof assignmentIs;
      }
    >(() => ({
      is: assignmentIs,
    }));

    const assetSelect = jest.fn(() => ({
      eq: assetEq,
    }));

    const assignmentSelect = jest.fn(() => ({
      eq: assignmentEq,
    }));

    const from = jest.fn((table: string) => {
      if (table === "assets") {
        return { select: assetSelect };
      }

      return { select: assignmentSelect };
    });

    const supabase = { from } as unknown as SupabaseClient;

    const result = await getAsset(supabase, 10);

    expect(result.error).toBeNull();
    expect(result.asset?.assignment_status).toBe("Available");
    expect(result.asset?.assigned_user).toBeNull();
    expect(result.asset?.assigned_date).toBeNull();

    expect(assignmentEq).toHaveBeenCalledWith("asset_id", 10);
    expect(assignmentIs).toHaveBeenCalledWith("returned_date", null);
  });
});
