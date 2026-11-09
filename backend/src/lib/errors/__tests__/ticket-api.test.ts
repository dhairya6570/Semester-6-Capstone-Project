import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { GET, POST } from "@/app/api/tickets/route";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTickets } from "@/lib/tickets/get-tickets";
import { createTicket } from "@/lib/tickets/create-ticket";
import { logServerError } from "@/lib/errors/logger";

jest.mock("@/lib/supabase/server");
jest.mock("@/lib/tickets/get-tickets");
jest.mock("@/lib/tickets/create-ticket");
jest.mock("@/lib/errors/logger");

const mockClient = jest.mocked(createSupabaseServerClient);
const mockGetTickets = jest.mocked(getTickets);
const mockCreateTicket = jest.mocked(createTicket);
const mockLogger = jest.mocked(logServerError);

const secret = "SECRET_DATABASE_PASSWORD_123";

const ticketBody = {
  title: "Test security ticket",
  description: "Testing generic API error responses",
  category: "Software Issue",
  priority: "Medium",
};

describe("Ticket API secure error responses", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockClient.mockResolvedValue({
      auth: {
        getUser: jest.fn<() => Promise<unknown>>().mockResolvedValue({
          data: { user: { id: "test-user" } },
          error: null,
        }),
      },
    } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
  });

  test("GET hides database errors and logs them", async () => {
    mockGetTickets.mockResolvedValue({
      tickets: null,
      error: { message: secret },
    } as Awaited<ReturnType<typeof getTickets>>);

    const response = await GET(new Request("http://localhost:3001/api/tickets"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Tickets could not be loaded." });
    expect(JSON.stringify(body)).not.toContain(secret);
    expect(mockLogger).toHaveBeenCalledWith(
      expect.objectContaining({ message: secret }),
      { route: "/api/tickets", operation: "GET" }
    );
  });

  test("GET handles unexpected exceptions safely", async () => {
    mockGetTickets.mockRejectedValue(new Error(secret));

    const response = await GET(new Request("http://localhost:3001/api/tickets"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Tickets could not be loaded." });
    expect(JSON.stringify(body)).not.toContain(secret);
    expect(mockLogger).toHaveBeenCalled();
  });

  test("POST hides database errors and logs them", async () => {
    mockCreateTicket.mockResolvedValue({
      ticket: null,
      error: { message: secret },
    } as Awaited<ReturnType<typeof createTicket>>);

    const response = await POST(
      new Request("http://localhost:3001/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketBody),
      })
    );

    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Ticket could not be created." });
    expect(JSON.stringify(body)).not.toContain(secret);
    expect(mockLogger).toHaveBeenCalledWith(
      expect.objectContaining({ message: secret }),
      { route: "/api/tickets", operation: "POST" }
    );
  });

  test("POST handles unexpected exceptions safely", async () => {
    mockCreateTicket.mockRejectedValue(new Error(secret));

    const response = await POST(
      new Request("http://localhost:3001/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketBody),
      })
    );

    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Ticket could not be created." });
    expect(JSON.stringify(body)).not.toContain(secret);
    expect(mockLogger).toHaveBeenCalled();
  });
});
