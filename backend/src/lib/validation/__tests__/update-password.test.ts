import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { updatePassword } from "../../auth/update-password";
import { createSupabaseServerClient } from "../../supabase/server";

jest.mock("../../supabase/server", () => ({
  createSupabaseServerClient: jest.fn(),
}));

const mockedCreateSupabaseServerClient =
  createSupabaseServerClient as jest.MockedFunction<
    typeof createSupabaseServerClient
  >;

interface SignInCredentials {
  email: string;
  password: string;
}

interface SignInResult {
  data: {
    user: null;
    session: null;
  };
  error: {
    message: string;
  };
}

describe("Password update", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("UT-13: rejects an incorrect current password", async () => {
    const signInWithPassword = jest.fn<
      (credentials: SignInCredentials) => Promise<SignInResult>
    >();

    signInWithPassword.mockResolvedValue({
      data: {
        user: null,
        session: null,
      },
      error: {
        message: "Invalid login credentials",
      },
    });

    const updateUser = jest.fn();

    mockedCreateSupabaseServerClient.mockResolvedValue({
      auth: {
        signInWithPassword,
        updateUser,
      },
    } as never);

    const result = await updatePassword(
      "employee@test.com",
      "WrongPassword@123",
      "NewPassword@123"
    );

    expect(result).toEqual({
      success: false,
      error: "Current password is incorrect.",
    });

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "employee@test.com",
      password: "WrongPassword@123",
    });

    expect(updateUser).not.toHaveBeenCalled();
  });
});