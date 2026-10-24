
import { describe, expect, jest, test } from "@jest/globals";
import type { SupabaseClient } from "@supabase/supabase-js";
import { unassignAsset } from "@/lib/assets/unassign-asset";

type MockResult = {
  data: unknown;
  error: { message: string } | null;
};

function createMockSupabase(results: MockResult[]) {
  let index = 0;

  const updates: Array<{
    table: string;
    payload: unknown;
  }> = [];

  const from = jest.fn((table: string) => {
    const query = {
      select: jest.fn(),
      eq: jest.fn(),
      is: jest.fn(),
      maybeSingle: jest.fn(),
      update: jest.fn(),
    };

    query.select.mockImplementation((() => query) as never);
    query.eq.mockImplementation((() => query) as never);
    query.is.mockImplementation((() => query) as never);

    query.update.mockImplementation(
      ((payload: unknown) => {
        updates.push({ table, payload });
        return query;
      }) as never
    );

    query.maybeSingle.mockImplementation(
      (() => results[index++]) as never
    );

    return query;
  });

  return {
    supabase: { from } as unknown as SupabaseClient,
    updates,
  };
}

describe("unassignAsset", () => {
  const assetId = 9;
  const userId = "4ed0dcb8-2406-4876-ba8b-c9eb2c73f87f";

  const existingAsset = {
    id: assetId,
  };

  const activeAssignment = {
    id: 1,
  };

  const returnedAssignment = {
    id: 1,
    asset_id: assetId,
    user_id: userId,
    assigned_date: "2026-10-24",
    returned_date: "2026-10-24",
  };

  test("successfully unassigns an assigned asset", async () => {
    const { supabase, updates } = createMockSupabase([
      { data: existingAsset, error: null },
      { data: activeAssignment, error: null },
      { data: returnedAssignment, error: null },
    ]);

    const result = await unassignAsset(supabase, assetId);

    expect(result.status).toBe(200);
    expect(result.error).toBeNull();
    expect(result.assignment).toEqual(returnedAssignment);

    expect(updates).toHaveLength(1);
    expect(updates[0].table).toBe("asset_assignments");
    expect(updates[0].payload).toEqual({
      returned_date: expect.stringMatching(
        /^\d{4}-\d{2}-\d{2}$/
      ),
    });
  });

  test("rejects an asset that does not exist", async () => {
    const { supabase, updates } = createMockSupabase([
      { data: null, error: null },
    ]);

    const result = await unassignAsset(supabase, assetId);

    expect(result.status).toBe(404);
    expect(result.error).toBe("Asset not found.");
    expect(updates).toHaveLength(0);
  });

  test("rejects an asset that is not assigned", async () => {
    const { supabase, updates } = createMockSupabase([
      { data: existingAsset, error: null },
      { data: null, error: null },
    ]);

    const result = await unassignAsset(supabase, assetId);

    expect(result.status).toBe(409);
    expect(result.error).toBe(
      "Asset is not currently assigned."
    );
    expect(updates).toHaveLength(0);
  });

  test("handles asset lookup database errors", async () => {
    const { supabase } = createMockSupabase([
      {
        data: null,
        error: { message: "Database error" },
      },
    ]);

    const result = await unassignAsset(supabase, assetId);

    expect(result.status).toBe(500);
    expect(result.error).toBe("Asset could not be loaded.");
  });

  test("handles assignment lookup database errors", async () => {
    const { supabase } = createMockSupabase([
      { data: existingAsset, error: null },
      {
        data: null,
        error: { message: "Database error" },
      },
    ]);

    const result = await unassignAsset(supabase, assetId);

    expect(result.status).toBe(500);
    expect(result.error).toBe(
      "Asset assignment could not be loaded."
    );
  });

  test("handles assignment update database errors", async () => {
    const { supabase } = createMockSupabase([
      { data: existingAsset, error: null },
      { data: activeAssignment, error: null },
      {
        data: null,
        error: { message: "Database error" },
      },
    ]);

    const result = await unassignAsset(supabase, assetId);

    expect(result.status).toBe(500);
    expect(result.error).toBe("Asset could not be unassigned.");
  });

  test("handles an assignment returned by another request", async () => {
    const { supabase } = createMockSupabase([
      { data: existingAsset, error: null },
      { data: activeAssignment, error: null },
      { data: null, error: null },
    ]);

    const result = await unassignAsset(supabase, assetId);

    expect(result.status).toBe(409);
    expect(result.error).toBe(
      "Asset is not currently assigned."
    );
  });

  test("does not update an asset that is already available", async () => {
    const { supabase, updates } = createMockSupabase([
      { data: existingAsset, error: null },
      { data: null, error: null },
    ]);

    await unassignAsset(supabase, assetId);

    expect(updates).toHaveLength(0);
  });
});
