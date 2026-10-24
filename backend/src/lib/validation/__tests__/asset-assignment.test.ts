import { describe, expect, test } from "@jest/globals";
import { validateAssignAsset } from "../asset-assignment";

describe("validateAssignAsset", () => {
  const validUserId = "550e8400-e29b-41d4-a716-446655440000";

  test("accepts a valid employee UUID", () => {
    const result = validateAssignAsset({
      userId: validUserId,
    });

    expect(result).toEqual({
      valid: true,
      data: {
        userId: validUserId,
      },
    });
  });

  test("trims whitespace around the employee UUID", () => {
    const result = validateAssignAsset({
      userId: `  ${validUserId}  `,
    });

    expect(result.valid).toBe(true);
    expect(result.data?.userId).toBe(validUserId);
  });

  test("rejects a missing userId", () => {
    const result = validateAssignAsset({});

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  test("rejects an empty userId", () => {
    const result = validateAssignAsset({
      userId: "",
    });

    expect(result.valid).toBe(false);
  });

  test("rejects an invalid UUID", () => {
    const result = validateAssignAsset({
      userId: "not-a-valid-uuid",
    });

    expect(result.valid).toBe(false);
  });

  test("rejects a non-string userId", () => {
    const result = validateAssignAsset({
      userId: 12345,
    });

    expect(result.valid).toBe(false);
  });

  test("rejects a null request body", () => {
    const result = validateAssignAsset(null);

    expect(result.valid).toBe(false);
  });

  test("rejects an array request body", () => {
    const result = validateAssignAsset([
      { userId: validUserId },
    ]);

    expect(result.valid).toBe(false);
  });

  test("rejects additional unexpected fields", () => {
    const result = validateAssignAsset({
      userId: validUserId,
      assetId: 10,
    });

    expect(result.valid).toBe(false);
  });

  test("rejects an invalid UUID version", () => {
    const result = validateAssignAsset({
      userId: "550e8400-e29b-01d4-a716-446655440000",
    });

    expect(result.valid).toBe(false);
  });
});
