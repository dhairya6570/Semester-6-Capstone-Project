import { API_URL } from "@/lib/api/config";
import type { UserRole } from "@/lib/api/auth";

export interface CreateUserInput {
  fullName: string;
  email: string;
  role: UserRole;
  password: string;
}

export interface CreatedUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface CreateUserResponse {
  message: string;
  user: CreatedUser;
}

export async function createUser(
  input: CreateUserInput
): Promise<CreateUserResponse> {
  const response = await fetch(`${API_URL}/api/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to create user account.");
  }

  return data;
}

export interface Employee {
  id: string;
  full_name: string;
}

export async function getEmployees(): Promise<Employee[]> {
  const response = await fetch(`${API_URL}/api/admin/users`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Unable to load employees."
    );
  }

  return data.employees;
}