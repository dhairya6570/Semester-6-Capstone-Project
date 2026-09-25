import { describe, expect, test } from "@jest/globals";
import { validateCreateTicket } from "../ticket";

describe("Ticket validation", () => {
  test("UT-04: accepts a ticket title at exactly 100 characters", () => {
    const title = "A".repeat(100);

    const result = validateCreateTicket(
      title,
      "Laptop will not start.",
      "Hardware Issue",
      "High"
    );

    expect(result.valid).toBe(true);
  });

  test("UT-05: rejects a ticket title exceeding 100 characters", () => {
    const title = "A".repeat(101);

    const result = validateCreateTicket(
      title,
      "Laptop will not start.",
      "Hardware Issue",
      "High"
    );

    expect(result.valid).toBe(false);
  });

  test("UT-06: accepts a ticket description at exactly 1000 characters", () => {
    const description = "A".repeat(1000);

    const result = validateCreateTicket(
      "Laptop issue",
      description,
      "Hardware Issue",
      "High"
    );

    expect(result.valid).toBe(true);
  });

  test("UT-07: rejects a ticket description exceeding 1000 characters", () => {
    const description = "A".repeat(1001);

    const result = validateCreateTicket(
      "Laptop issue",
      description,
      "Hardware Issue",
      "High"
    );

    expect(result.valid).toBe(false);
  });
});