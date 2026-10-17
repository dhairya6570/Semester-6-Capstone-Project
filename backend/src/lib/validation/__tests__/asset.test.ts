
import { describe, expect, test } from "@jest/globals";
import { validateCreateAsset, validateUpdateAsset } from "../asset";

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
