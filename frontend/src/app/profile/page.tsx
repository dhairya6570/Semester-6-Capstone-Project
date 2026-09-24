"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getProfile,
  updatePassword,
  type UserProfile,
} from "@/lib/api/profile";

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] =
    useState(false);

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

  async function handlePasswordUpdate(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPasswordError("");
    setPasswordMessage("");
    setIsUpdatingPassword(true);

    try {
      const response = await updatePassword(
        currentPassword,
        newPassword,
        confirmPassword
      );

      setPasswordMessage(response.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update password.";

      setPasswordError(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  }

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

      <section aria-labelledby="change-password-heading">
        <h2 id="change-password-heading">Change Password</h2>

        <form onSubmit={handlePasswordUpdate}>
          <div>
            <label htmlFor="current-password">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(event.target.value)
              }
              autoComplete="current-password"
              required
            />
          </div>

          <div>
            <label htmlFor="new-password">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label htmlFor="confirm-password">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              autoComplete="new-password"
              required
            />
          </div>

          <p>
            Password must contain at least 8 characters,
            including an uppercase letter, lowercase letter,
            number, and special character.
          </p>

          {passwordError && (
            <p role="alert">{passwordError}</p>
          )}

          {passwordMessage && (
            <p role="status">{passwordMessage}</p>
          )}

          <button
            type="submit"
            disabled={isUpdatingPassword}
          >
            {isUpdatingPassword
              ? "Updating Password..."
              : "Update Password"}
          </button>
        </form>
      </section>
    </main>
  );
}