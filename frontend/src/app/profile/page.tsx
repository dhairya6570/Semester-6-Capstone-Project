"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getProfile,
  type UserProfile,
} from "@/lib/api/profile";

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await getProfile();
        setProfile(response.user);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to load user profile.";

        if (message === "Authentication required.") {
          router.replace("/login");
          return;
        }

        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  if (isLoading) {
    return (
      <main>
        <p>Loading profile...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>User Profile</h1>
        <p role="alert">{error}</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main>
        <h1>User Profile</h1>
        <p role="alert">Profile information is unavailable.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>User Profile</h1>

      <section aria-labelledby="profile-information-heading">
        <h2 id="profile-information-heading">
          Profile Information
        </h2>

        <dl>
          <dt>Full Name</dt>
          <dd>{profile.fullName || "Not provided"}</dd>

          <dt>Email</dt>
          <dd>{profile.email}</dd>

          <dt>Role</dt>
          <dd>{profile.role}</dd>

          <dt>Account Created</dt>
          <dd>
            {new Date(profile.createdAt).toLocaleDateString()}
          </dd>
        </dl>
      </section>
    </main>
  );
}