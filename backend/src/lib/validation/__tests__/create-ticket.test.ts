import { describe, expect, jest, test,} from "@jest/globals";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createTicket } from "@/lib/tickets/create-ticket";

describe("Ticket creation", () => {
  test("UT-10: automatically creates a new ticket with Open status", async () => {
    const createdTicket = {
      id: 1,
      user_id: "test-user-id",
      title: "Laptop issue",
      description: "Laptop will not start.",
      category: "Hardware Issue",
      priority: "High",
      status: "Open",
      created_at: "2026-09-30T12:00:00.000Z",
    };

    const single = jest.fn(async () => ({
      data: createdTicket,
      error: null,
    }));

    const select = jest.fn(() => ({
      single,
    }));

    const insert = jest.fn<
        (payload: Record<string, unknown>) => {
            select: typeof select;
        }
    >(() => ({
        select,
    }));

    const from = jest.fn(() => ({
      insert,
    }));

    const supabase = {
      from,
    } as unknown as SupabaseClient;

    const result = await createTicket(
      supabase,
      "test-user-id",
      {
        title: "Laptop issue",
        description: "Laptop will not start.",
        category: "Hardware Issue",
        priority: "High",
      }
    );

    expect(insert).toHaveBeenCalledWith({
      user_id: "test-user-id",
      title: "Laptop issue",
      description: "Laptop will not start.",
      category: "Hardware Issue",
      priority: "High",
    });

    expect(result.ticket?.status).toBe("Open");
  });
});