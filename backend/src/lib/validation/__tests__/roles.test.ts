import { describe, expect, test } from "@jest/globals";
import { isAdministrator } from "../../auth/roles";

describe("Administrator role helper", () => {
  test("UT-08: returns true for Administrator role", () => {
    expect(isAdministrator("Administrator")).toBe(true);
  });

  test("UT-09: returns false for Employee role", () => {
    expect(isAdministrator("Employee")).toBe(false);
  });
});