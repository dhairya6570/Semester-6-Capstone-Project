
import { describe, expect, jest, test } from "@jest/globals";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAssets } from "@/lib/assets/get-assets";

const sampleAssets = [
  {
    id: 1,
    asset_code: "AST-0001",
    asset_name: "Dell Laptop",
    asset_type: "Laptop",
    serial_number: "TEST-001",
    purchase_date: "2026-10-15",
    created_at: "2026-10-15T10:00:00Z",
    updated_at: "2026-10-15T10:00:00Z",
    asset_assignments: [
      { id: 1, returned_date: null },
    ],
  },
  {
    id: 2,
    asset_code: "AST-0002",
    asset_name: "HP Monitor",
    asset_type: "Monitor",
    serial_number: "TEST-002",
    purchase_date: "2026-10-16",
    created_at: "2026-10-16T10:00:00Z",
    updated_at: "2026-10-16T10:00:00Z",
    asset_assignments: [],
  },
  {
    id: 3,
    asset_code: "AST-0003",
    asset_name: "Lenovo Desktop",
    asset_type: "Desktop Computer",
    serial_number: "TEST-003",
    purchase_date: "2026-10-17",
    created_at: "2026-10-17T10:00:00Z",
    updated_at: "2026-10-17T10:00:00Z",
    asset_assignments: [
      { id: 2, returned_date: "2026-10-20" },
    ],
  },
];

function createMockSupabase(
  assets: typeof sampleAssets | null,
  databaseError: { message: string } | null = null
) {
  const order = jest.fn(async () => ({
    data: assets,
    error: databaseError,
  }));

  const select = jest.fn(() => ({ order }));
  const from = jest.fn(() => ({ select }));

  const supabase = { from } as unknown as SupabaseClient;

  return { supabase, from, select, order };
}

describe("Week 9 - Asset assignment status filtering", () => {
  test("returns all assets when no filter is provided", async () => {
    const { supabase } = createMockSupabase(sampleAssets);

    const result = await getAssets(supabase);

    expect(result.error).toBeNull();
    expect(result.assets).toHaveLength(3);
  });

  test("returns only Assigned assets", async () => {
    const { supabase } = createMockSupabase(sampleAssets);

    const result = await getAssets(supabase, "Assigned");

    expect(result.error).toBeNull();
    expect(result.assets).toHaveLength(1);
    expect(result.assets?.[0].id).toBe(1);
    expect(result.assets?.[0].assignment_status).toBe("Assigned");
  });

  test("returns only Available assets", async () => {
    const { supabase } = createMockSupabase(sampleAssets);

    const result = await getAssets(supabase, "Available");

    expect(result.error).toBeNull();
    expect(result.assets).toHaveLength(2);
    expect(result.assets?.map((asset) => asset.id)).toEqual([2, 3]);
  });

  test("treats a previously returned asset as Available", async () => {
    const { supabase } = createMockSupabase(sampleAssets);

    const result = await getAssets(supabase, "Available");

    const returnedAsset = result.assets?.find(
      (asset) => asset.id === 3
    );

    expect(returnedAsset?.assignment_status).toBe("Available");
  });

  test("returns a database error without returning assets", async () => {
    const { supabase } = createMockSupabase(null, {
      message: "Database query failed",
    });

    const result = await getAssets(supabase);

    expect(result.assets).toBeNull();
    expect(result.error?.message).toBe("Database query failed");
  });

  test("returns an empty array when no assets exist", async () => {
    const { supabase } = createMockSupabase([]);

    const result = await getAssets(supabase, "Assigned");

    expect(result.error).toBeNull();
    expect(result.assets).toEqual([]);
  });
});
