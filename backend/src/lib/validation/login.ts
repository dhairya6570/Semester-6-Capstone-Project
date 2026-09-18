export type LoginCredentials = {
  email: string;
  password: string;
};

export function validateLoginCredentials(
  email: unknown,
  password: unknown
): LoginCredentials | null {
  if (
    typeof email !== "string" ||
    email.trim() === "" ||
    typeof password !== "string" ||
    password === ""
  ) {
    return null;
  }

  return {
    email: email.trim(),
    password,
  };
}