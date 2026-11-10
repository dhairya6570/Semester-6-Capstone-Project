import { logServerError } from "../logger";
import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";

describe("Secure server-side error logging", () => {
  let consoleErrorSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("includes a valid timestamp and error level", () => {
    logServerError(new Error("Test error"), {
      route: "/api/tickets",
      operation: "GET",
    });

    const log = JSON.parse(consoleErrorSpy.mock.calls[0][0]);

    expect(Number.isNaN(Date.parse(log.timestamp))).toBe(false);
    expect(log.level).toBe("error");
  });

  test("records error type, route, and operation", () => {
    logServerError(new TypeError("Invalid data"), {
      route: "/api/assets",
      operation: "POST",
    });

    const log = JSON.parse(consoleErrorSpy.mock.calls[0][0]);

    expect(log.errorType).toBe("TypeError");
    expect(log.route).toBe("/api/assets");
    expect(log.operation).toBe("POST");
  });

  test("does not expose sensitive messages or stack traces", () => {
    const error = new Error("SECRET_PASSWORD_123");

    logServerError(error, {
      route: "/api/auth/login",
      operation: "POST",
    });

    const output = consoleErrorSpy.mock.calls[0][0];

    expect(output).not.toContain("SECRET_PASSWORD_123");
    expect(output).not.toContain("stack");
    expect(output).not.toContain("password");
  });

  test("handles unexpected non-Error values safely", () => {
    logServerError("Sensitive database error", {
      route: "/api/tickets",
      operation: "GET",
    });

    const log = JSON.parse(consoleErrorSpy.mock.calls[0][0]);

    expect(log.errorType).toBe("UnknownError");
    expect(JSON.stringify(log)).not.toContain("Sensitive database error");
  });
});
