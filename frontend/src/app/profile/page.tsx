
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getProfile,
  updatePassword,
  type UserProfile,
} from "@/lib/api/profile";
import AppShell from "@/components/layout/AppShell";

function formatAccountDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString("en-CA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

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
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await getProfile();
        setProfile(response.user);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
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

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please complete all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirmation password do not match."
      );
      return;
    }

    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      setPasswordError(
        "New password must contain at least 8 characters, including an uppercase letter, lowercase letter, number, and special character."
      );
      return;
    }

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
    } catch (err) {
      setPasswordError(
        err instanceof Error
          ? err.message
          : "Unable to update password."
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7F8] px-5">
        <p role="status" className="text-sm text-[#526672]">
          Loading your profile...
        </p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7F8] px-5">
        <div className="w-full max-w-lg rounded-2xl border border-[#DCE6E9] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-[#101F2B]">
            User Profile
          </h1>
          <p
            role="alert"
            className="mt-5 rounded-xl border border-[#F1C9CF] bg-[#FFF1F2] px-5 py-4 text-sm text-[#B4233B]"
          >
            {error || "Profile information is unavailable."}
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex text-sm font-semibold text-[#087F70] hover:underline"
          >
            ← Back to Login
          </Link>
        </div>
      </main>
    );
  }

  const isAdministrator = profile.role === "Administrator";
  const dashboardPath = isAdministrator ? "/admin" : "/dashboard";

  const inputClassName =
    "mt-2 w-full rounded-xl border border-[#CBDDE1] bg-white px-4 py-3 text-[#101F2B] outline-none transition focus:border-[#087F70] focus:ring-2 focus:ring-[#087F70]/15";

  return (
    <AppShell role={isAdministrator ? "Administrator" : "Employee"}>
      <div className="space-y-8">
        <header>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#087F70]">
            {isAdministrator
              ? "Administrator Workspace"
              : "Employee Workspace"}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#101F2B] sm:text-4xl">
            My Profile
          </h1>
          <p className="mt-3 text-base text-[#526672]">
            View your account information and manage your password.
          </p>
        </header>

        <section
          aria-labelledby="profile-information-heading"
          className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-sm"
        >
          <div className="border-b border-[#E1E9EC] px-6 py-6 sm:px-8">
            <h2
              id="profile-information-heading"
              className="text-xl font-bold text-[#101F2B]"
            >
              Profile Information
            </h2>
            <p className="mt-2 text-sm text-[#526672]">
              Your registered account details.
            </p>
          </div>

          <dl className="grid gap-x-10 gap-y-8 px-6 py-8 sm:grid-cols-2 sm:px-8">
            <div>
              <dt className="text-sm font-semibold text-[#526672]">
                Full Name
              </dt>
              <dd className="mt-2 text-base font-semibold text-[#101F2B]">
                {profile.fullName || "Not provided"}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-semibold text-[#526672]">
                Email Address
              </dt>
              <dd className="mt-2 break-all text-base text-[#101F2B]">
                {profile.email}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-semibold text-[#526672]">
                Account Role
              </dt>
              <dd className="mt-2">
                <span className="inline-flex rounded-full bg-[#E4F4EF] px-3 py-1 text-sm font-semibold text-[#087F70]">
                  {profile.role}
                </span>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-semibold text-[#526672]">
                Account Created
              </dt>
              <dd className="mt-2 text-base text-[#101F2B]">
                {formatAccountDate(profile.createdAt)}
              </dd>
            </div>
          </dl>
        </section>

        <section
          aria-labelledby="change-password-heading"
          className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-sm"
        >
          <div className="border-b border-[#E1E9EC] px-6 py-6 sm:px-8">
            <h2
              id="change-password-heading"
              className="text-xl font-bold text-[#101F2B]"
            >
              Change Password
            </h2>
            <p className="mt-2 text-sm text-[#526672]">
              Update your password to keep your account secure.
            </p>
          </div>

          <form
            onSubmit={handlePasswordUpdate}
            noValidate
            className="space-y-6 px-6 py-8 sm:px-8"
          >
            <div className="max-w-xl">
              <label
                htmlFor="current-password"
                className="block text-sm font-semibold text-[#101F2B]"
              >
                Current Password <span className="text-[#B4233B]">*</span>
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(event.target.value)
                }
                autoComplete="current-password"
                className={inputClassName}
                disabled={isUpdatingPassword}
              />
            </div>

            <div className="max-w-xl">
              <label
                htmlFor="new-password"
                className="block text-sm font-semibold text-[#101F2B]"
              >
                New Password <span className="text-[#B4233B]">*</span>
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                autoComplete="new-password"
                className={inputClassName}
                disabled={isUpdatingPassword}
              />
            </div>

            <div className="max-w-xl">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-semibold text-[#101F2B]"
              >
                Confirm New Password{" "}
                <span className="text-[#B4233B]">*</span>
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                className={inputClassName}
                disabled={isUpdatingPassword}
              />
            </div>

            <p className="max-w-xl text-sm leading-6 text-[#526672]">
              Your new password must contain at least 8 characters,
              including an uppercase letter, lowercase letter,
              number, and special character.
            </p>

            {passwordError && (
              <p
                role="alert"
                className="max-w-xl rounded-xl border border-[#F1C9CF] bg-[#FFF1F2] px-5 py-4 text-sm text-[#B4233B]"
              >
                {passwordError}
              </p>
            )}

            {passwordMessage && (
              <p
                role="status"
                className="max-w-xl rounded-xl border border-[#B9E4D3] bg-[#E7F7EF] px-5 py-4 text-sm text-[#08704F]"
              >
                {passwordMessage}
              </p>
            )}

            <div className="border-t border-[#E1E9EC] pt-6">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#087F70] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#06695D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdatingPassword
                  ? "Updating Password..."
                  : "Update Password"}
              </button>
            </div>
          </form>
        </section>

        <Link
          href={dashboardPath}
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#CBDDE1] bg-white px-6 py-3 text-sm font-semibold text-[#101F2B] hover:bg-[#F4F7F8]"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </AppShell>
  );
}
