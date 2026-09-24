import { API_URL } from "@/lib/api/config";
import type { UserRole } from "@/lib/api/auth";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface ProfileResponse {
  user: UserProfile;
}

export async function getProfile(): Promise<ProfileResponse> {
  const response = await fetch(`${API_URL}/api/profile`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to load user profile.");
  }

  return data;
}