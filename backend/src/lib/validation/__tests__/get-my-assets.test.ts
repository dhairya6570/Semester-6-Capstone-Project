import { describe, expect, jest, test } from "@jest/globals";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getMyAssets } from "@/lib/assets/get-my-assets";

type MockResult = {
  data: unknown;
  error: { message: string } | null;
};

function createMockSupabase(result: MockResult) {
  const filters: Array<{
    method: string;
    column: string;
    value: unknown;
  }> = [];

  const from = jest.fn((table: string) => {
    void table;

    const query = {
      select: jest.fn(),
      eq: jest.fn(),
      is: jest.fn(),
      order: jest.fn(),
    };

    query.select.mockImplementation((() => query) as never);

    query.eq.mockImplementation(
      ((column: string, value: unknown) => {
        filters.push({
          method: "eq",
          column,
          value,
        });

        return query;
      }) as never
    );

    query.is.mockImplementation(
      ((column: string, value: unknown) => {
        filters.push({
          method: "is",
          column,
          value,
        });

        return query;
      }) as never
    );

    query.order.mockImplementation(
      (() => Promise.resolve(result)) as never
    );

    return query;
  });

  return {
    supabase: { from } as unknown as SupabaseClient,
    from,
    filters,
  };
}

describe("getMyAssets", () => {
  const userId = "4ed0dcb8-2406-4876-ba8b-c9eb2c73f87f";

  const assignment = {
    id: 2,
    assigned_date: "2026-10-24",
    assets: {
      id: 9,
      asset_code: "AST-0009",
      asset_name: "Postman Test Laptop",
      asset_type: "Laptop",
      serial_number: "TEST-123",
      purchase_date: "2026-10-17",
    },
  };

  test("returns assets assigned to the employee", async () => {
    const { supabase } = createMockSupabase({
      data: [assignment],
      error: null,
    });

    const result = await getMyAssets(supabase, userId);

    expect(result.error).toBeNull();
    expect(result.assets).toEqual([
      {
        ...assignment.assets,
        assignment_id: 2,
        assigned_date: "2026-10-24",
        assignment_status: "Assigned",
      },
    ]);
  });

  test("filters assignments by authenticated user ID", async () => {
    const { supabase, filters } = createMockSupabase({
      data: [],
      error: null,
    });

    await getMyAssets(supabase, userId);

    expect(filters).toContainEqual({
      method: "eq",
      column: "user_id",
      value: userId,
    });
  });

  test("excludes returned assignments", async () => {
    const { supabase, filters } = createMockSupabase({
      data: [],
      error: null,
    });

    await getMyAssets(supabase, userId);

    expect(filters).toContainEqual({
      method: "is",
      column: "returned_date",
      value: null,
    });
  });

  test("queries the asset_assignments table", async () => {
    const { supabase, from } = createMockSupabase({
      data: [],
      error: null,
    });

    await getMyAssets(supabase, userId);

    expect(from).toHaveBeenCalledWith("asset_assignments");
  });

  test("returns an empty array when no assets are assigned", async () => {
    const { supabase } = createMockSupabase({
      data: [],
      error: null,
    });

    const result = await getMyAssets(supabase, userId);

    expect(result.error).toBeNull();
    expect(result.assets).toEqual([]);
  });

  test("handles null assignment results", async () => {
    const { supabase } = createMockSupabase({
      data: null,
      error: null,
    });

    const result = await getMyAssets(supabase, userId);

    expect(result.error).toBeNull();
    expect(result.assets).toEqual([]);
  });

  test("ignores assignments without an associated asset", async () => {
    const { supabase } = createMockSupabase({
      data: [
        assignment,
        {
          id: 3,
          assigned_date: "2026-10-24",
          assets: null,
        },
      ],
      error: null,
    });

    const result = await getMyAssets(supabase, userId);

    expect(result.error).toBeNull();
    expect(result.assets).toHaveLength(1);

    expect(result.assets?.[0]).toMatchObject({
      asset_code: "AST-0009",
      asset_name: "Postman Test Laptop",
      assignment_status: "Assigned",
    });
  });

  test("handles Supabase database errors", async () => {
    const databaseError = {
      message: "Database error",
    };

    const { supabase } = createMockSupabase({
      data: null,
      error: databaseError,
    });

    const result = await getMyAssets(supabase, userId);

    expect(result.assets).toBeNull();
    expect(result.error).toEqual(databaseError);
  });
});