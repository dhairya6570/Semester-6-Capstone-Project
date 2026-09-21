import { API_URL } from "@/lib/api/config";

export type UserRole = "Administrator" | "Employee";

export interface AuthUser {
  id: string;
  email: string;
  role?: UserRole;
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
}

export interface SessionResponse {
  authenticated: boolean;
  user: AuthUser | null;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to log in.");
  }

  return data;
}

export async function getSession(): Promise<SessionResponse> {
  const response = await fetch(`${API_URL}/api/auth/session`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (response.status === 401) {
    return {
      authenticated: false,
      user: null,
    };
  }

  if (!response.ok) {
    throw new Error(data.error || "Unable to verify session.");
  }

  return data;
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to log out.");
  }
}