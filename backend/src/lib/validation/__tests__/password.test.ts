import { describe, expect, test } from "@jest/globals";
import { isPasswordValid } from "../password";

describe("Password complexity validation", () => {
  test("UT-01: accepts a password that meets all complexity requirements", () => {
    const password = "Test@1234";

    expect(isPasswordValid(password)).toBe(true);
    });
  
  test("UT-02: rejects a password missing a special character", () => {
    const password = "Test1234";

    expect(isPasswordValid(password)).toBe(false);
    });
    
  test("UT-03: rejects a password shorter than eight characters", () => {
    const password = "Te@123";

    expect(isPasswordValid(password)).toBe(false);
    });


});