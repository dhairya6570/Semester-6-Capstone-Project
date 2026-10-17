
import { describe, expect, test } from "@jest/globals";
import { validateCreateAsset } from "../asset";

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
