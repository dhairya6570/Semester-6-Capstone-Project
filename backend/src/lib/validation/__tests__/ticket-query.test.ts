import { describe, expect, test } from "@jest/globals";
import { validateTicketQuery } from "../ticket-query";

describe("Ticket query validation - Week 9", () => {
  test("accepts default query parameters", () => {
    const result = validateTicketQuery(
      new URLSearchParams()
    );

    expect(result).toEqual({
      valid: true,
      data: {
        statuses: [],
        search: "",
        sort: "desc",
      },
    });
  });

  test("accepts a single ticket status", () => {
    const result = validateTicketQuery(
      new URLSearchParams("status=Open")
    );

    expect(result.valid).toBe(true);

    if (result.valid) {
      expect(result.data.statuses).toEqual(["Open"]);
    }
  });

  test("accepts multiple ticket statuses", () => {
    const result = validateTicketQuery(
      new URLSearchParams(
        "status=Open&status=Resolved"
      )
    );

    expect(result.valid).toBe(true);

    if (result.valid) {
      expect(result.data.statuses).toEqual([
        "Open",
        "Resolved",
      ]);
    }
  });

  test("accepts comma-separated statuses", () => {
    const result = validateTicketQuery(
      new URLSearchParams(
        "status=Open,Closed"
      )
    );

    expect(result.valid).toBe(true);

    if (result.valid) {
      expect(result.data.statuses).toEqual([
        "Open",
        "Closed",
      ]);
    }
  });

  test("rejects invalid ticket statuses", () => {
    const result = validateTicketQuery(
      new URLSearchParams("status=Pending")
    );

    expect(result).toEqual({
      valid: false,
      error: "Invalid ticket status filter.",
    });
  });

  test("removes duplicate statuses", () => {
    const result = validateTicketQuery(
      new URLSearchParams(
        "status=Open&status=Open"
      )
    );

    expect(result.valid).toBe(true);

    if (result.valid) {
      expect(result.data.statuses).toEqual(["Open"]);
    }
  });

  test("trims title search text", () => {
    const result = validateTicketQuery(
      new URLSearchParams({
        search: "  laptop issue  ",
      })
    );

    expect(result.valid).toBe(true);

    if (result.valid) {
      expect(result.data.search).toBe("laptop issue");
    }
  });

  test("rejects search text longer than 100 characters", () => {
    const result = validateTicketQuery(
      new URLSearchParams({
        search: "a".repeat(101),
      })
    );

    expect(result).toEqual({
      valid: false,
      error: "Search must be 100 characters or fewer.",
    });
  });

  test("accepts ascending date sorting", () => {
    const result = validateTicketQuery(
      new URLSearchParams("sort=asc")
    );

    expect(result.valid).toBe(true);

    if (result.valid) {
      expect(result.data.sort).toBe("asc");
    }
  });

  test("accepts descending date sorting", () => {
    const result = validateTicketQuery(
      new URLSearchParams("sort=desc")
    );

    expect(result.valid).toBe(true);

    if (result.valid) {
      expect(result.data.sort).toBe("desc");
    }
  });

  test("rejects invalid sorting options", () => {
    const result = validateTicketQuery(
      new URLSearchParams("sort=random")
    );

    expect(result).toEqual({
      valid: false,
      error: "Invalid ticket sort order.",
    });
  });

  test("accepts combined filtering, searching, and sorting", () => {
    const result = validateTicketQuery(
      new URLSearchParams(
        "status=Open&search=laptop&sort=asc"
      )
    );

    expect(result).toEqual({
      valid: true,
      data: {
        statuses: ["Open"],
        search: "laptop",
        sort: "asc",
      },
    });
  });
});
