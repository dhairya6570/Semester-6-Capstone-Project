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

  test("rejects login credentials when email is missing", () => {
    const result = validateLoginCredentials(
        "",
        "Test@1234"
    );

    expect(result).toBeNull();
  });

  test("rejects login credentials when password is missing", () => {
    const result = validateLoginCredentials(
        "employee@example.com",
        ""
    );

    expect(result).toBeNull();  
  });

  
});