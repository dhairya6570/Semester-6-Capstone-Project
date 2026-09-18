import { describe, expect, test } from "@jest/globals";
import { validateLoginCredentials } from "../login";

describe("Login credential validation", () => {
  test("accepts valid email and password credentials", () => {
    const result = validateLoginCredentials(
      "employee@example.com",
      "Test@1234"
    );

    expect(result).toEqual({
      email: "employee@example.com",
      password: "Test@1234",
    });
  });
});