import { isPasswordValid } from "@/lib/validation/password";

export type UserRole = "Employee" | "Administrator";

export interface CreateUserInput {
  fullName: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface CreateUserValidationResult {
  valid: boolean;
  error?: string;
  data?: CreateUserInput;
}

export function validateCreateUser(
  fullName: unknown,
  email: unknown,
  role: unknown,
  password: unknown
): CreateUserValidationResult {
  if (
    typeof fullName !== "string" ||
    typeof email !== "string" ||
    typeof role !== "string" ||
    typeof password !== "string"
  ) {
    return {
      valid: false,
      error: "Full name, email, role, and password are required.",
    };
  }

  const trimmedName = fullName.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName || !trimmedEmail || !role || !password) {
    return {
      valid: false,
      error: "Full name, email, role, and password are required.",
    };
  }

  if (role !== "Employee" && role !== "Administrator") {
    return {
      valid: false,
      error: "Invalid user role.",
    };
  }

  if (!isPasswordValid(password)) {
    return {
      valid: false,
      error: "Password does not meet complexity requirements.",
    };
  }

  return {
    valid: true,
    data: {
      fullName: trimmedName,
      email: trimmedEmail,
      role,
      password,
    },
  };
}