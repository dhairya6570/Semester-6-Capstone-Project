import { isPasswordValid } from "../password";

describe("Password complexity validation", () => {
  test("UT-01: accepts a password that meets all complexity requirements", () => {
    const password = "Test@1234";

    expect(isPasswordValid(password)).toBe(true);
  });
});