
import { describe, expect, jest, test } from "@jest/globals";
import type { SupabaseClient } from "@supabase/supabase-js";
import { assignAsset } from "@/lib/assets/assign-asset";

type MockResult = {
  data: unknown;
  error: { code?: string; message: string } | null;
};

function createMockSupabase(results: MockResult[]) {
  const calls: Array<{
    table: string;
    operation: string;
    payload?: unknown;
  }> = [];

  let index = 0;

  const from = jest.fn((table: string) => {
    const query = {
      select: jest.fn(),
      eq: jest.fn(),
      is: jest.fn(),
      limit: jest.fn(),
      maybeSingle: jest.fn(),
      single: jest.fn(),
      insert: jest.fn(),
    };

    const chainMethods = [
      "select",
      "eq",
      "is",
      "limit",
      "insert",
    ] as const;

    for (const method of chainMethods) {
      query[method].mockImplementation(
        (() => query) as never
      );
    }

    query.insert.mockImplementation(
      ((payload: unknown) => {
        calls.push({
          table,
          operation: "insert",
          payload,
        });

        return query;
      }) as never
    );

    query.maybeSingle.mockImplementation(
      (() => results[index++]) as never
    );

    query.single.mockImplementation(
      (() => results[index++]) as never
    );

    return query;
  });

  return {
    supabase: { from } as unknown as SupabaseClient,
    calls,
  };
}

describe("assignAsset", () => {
  const assetId = 1;
  const userId = "550e8400-e29b-41d4-a716-446655440000";

  const existingAsset = {
    id: assetId,
  };

  const validEmployee = {
    id: userId,
    role: "Employee",
  };

  const createdAssignment = {
    id: 10,
    asset_id: assetId,
    user_id: userId,
    assigned_date: "2026-10-23",
  };

  test("assigns an available asset to an employee", async () => {
    const { supabase, calls } = createMockSupabase([
      { data: existingAsset, error: null },
      { data: validEmployee, error: null },
      { data: null, error: null },
      { data: createdAssignment, error: null },
    ]);

    const result = await assignAsset(
      supabase,
      assetId,
      userId
    );

    expect(result).toEqual({
      assignment: createdAssignment,
      status: 200,
      error: null,
    });

    expect(calls).toContainEqual({
      table: "asset_assignments",
      operation: "insert",
      payload: {
        asset_id: assetId,
        user_id: userId,
      },
    });
  });

  test("rejects an asset that does not exist", async () => {
    const { supabase } = createMockSupabase([
      { data: null, error: null },
    ]);

    const result = await assignAsset(
      supabase,
      assetId,
      userId
    );

    expect(result.status).toBe(404);
    expect(result.assignment).toBeNull();
  });

  test("rejects an employee that does not exist", async () => {
    const { supabase } = createMockSupabase([
      { data: existingAsset, error: null },
      { data: null, error: null },
    ]);

    const result = await assignAsset(
      supabase,
      assetId,
      userId
    );

    expect(result.status).toBe(400);
    expect(result.assignment).toBeNull();
  });

  test("rejects assigning an asset to an administrator", async () => {
    const { supabase } = createMockSupabase([
      { data: existingAsset, error: null },
      {
        data: { id: userId, role: "Administrator" },
        error: null,
      },
    ]);

    const result = await assignAsset(
      supabase,
      assetId,
      userId
    );

    expect(result.status).toBe(400);
    expect(result.assignment).toBeNull();
  });

  test("rejects an already assigned asset", async () => {
    const { supabase, calls } = createMockSupabase([
      { data: existingAsset, error: null },
      { data: validEmployee, error: null },
      { data: { id: 5 }, error: null },
    ]);

    const result = await assignAsset(
      supabase,
      assetId,
      userId
    );

    expect(result.status).toBe(409);
    expect(result.error).toBe("Asset is already assigned.");
    expect(calls).toHaveLength(0);
  });

  test("handles simultaneous assignment conflicts", async () => {
    const { supabase } = createMockSupabase([
      { data: existingAsset, error: null },
      { data: validEmployee, error: null },
      { data: null, error: null },
      {
        data: null,
        error: {
          code: "23505",
          message: "Unique constraint violation",
        },
      },
    ]);

    const result = await assignAsset(
      supabase,
      assetId,
      userId
    );

    expect(result.status).toBe(409);
    expect(result.error).toBe("Asset is already assigned.");
  });

  test("handles asset lookup errors", async () => {
    const { supabase } = createMockSupabase([
      {
        data: null,
        error: { message: "Database error" },
      },
    ]);

    const result = await assignAsset(
      supabase,
      assetId,
      userId
    );

    expect(result.status).toBe(500);
    expect(result.assignment).toBeNull();
  });

  test("handles employee lookup errors", async () => {
    const { supabase } = createMockSupabase([
      { data: existingAsset, error: null },
      {
        data: null,
        error: { message: "Database error" },
      },
    ]);

    const result = await assignAsset(
      supabase,
      assetId,
      userId
    );

    expect(result.status).toBe(500);
    expect(result.assignment).toBeNull();
  });

  test("handles assignment lookup errors", async () => {
    const { supabase } = createMockSupabase([
      { data: existingAsset, error: null },
      { data: validEmployee, error: null },
      {
        data: null,
        error: { message: "Database error" },
      },
    ]);

    const result = await assignAsset(
      supabase,
      assetId,
      userId
    );

    expect(result.status).toBe(500);
    expect(result.assignment).toBeNull();
  });

  test("handles assignment insertion errors", async () => {
    const { supabase } = createMockSupabase([
      { data: existingAsset, error: null },
      { data: validEmployee, error: null },
      { data: null, error: null },
      {
        data: null,
        error: { message: "Database error" },
      },
    ]);

    const result = await assignAsset(
      supabase,
      assetId,
      userId
    );

    expect(result.status).toBe(500);
    expect(result.assignment).toBeNull();
  });
});
