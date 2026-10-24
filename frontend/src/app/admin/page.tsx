
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, type UserRole } from "@/lib/api/auth";
import { createUser } from "@/lib/api/users";
import AppShell from "@/components/layout/AppShell";

const inputClass =
  "mt-2 w-full rounded-xl border border-[#C8D6DC] bg-white px-4 py-3 text-[#101F2B] outline-none transition focus:border-[#087F70] focus:ring-2 focus:ring-[#087F70]/20";

const labelClass = "block text-sm font-semibold text-[#243B49]";

export default function AdminPage() {
  const router = useRouter();

  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Employee");
  const [password, setPassword] = useState("");

  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState("");
  const [createUserMessage, setCreateUserMessage] = useState("");

  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getSession();

        if (!session.authenticated || !session.user) {
          router.replace("/login");
          return;
        }

        if (session.user.role !== "Administrator") {
          router.replace("/dashboard");
          return;
        }

        setIsCheckingSession(false);
      } catch {
        router.replace("/login");
      }
    }

    checkSession();
  }, [router]);

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCreateUserError("");
    setCreateUserMessage("");

    if (!fullName.trim()) {
      setCreateUserError("Please enter the user's full name.");
      return;
    }

    if (!email.trim()) {
      setCreateUserError("Please enter the user's email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setCreateUserError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setCreateUserError("Please enter a password.");
      return;
    }

    setIsCreatingUser(true);

    try {
      const response = await createUser({
        fullName: fullName.trim(),
        email: email.trim(),
        role,
        password,
      });

      setCreateUserMessage(response.message);

      setFullName("");
      setEmail("");
      setRole("Employee");
      setPassword("");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create user account.";

      setCreateUserError(message);
    } finally {
      setIsCreatingUser(false);
    }
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7F8] px-5">
        <p role="status" className="text-sm text-[#405462]">
          Checking session...
        </p>
      </main>
    );
  }

  return (
    <AppShell role="Administrator">
      <div className="space-y-8">
        <header>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#087F70]">
            Administrator Workspace
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[#101F2B] sm:text-4xl">
            Admin Dashboard
          </h1>

          <p className="mt-3 text-base text-[#526672]">
            Manage IT assets, support tickets, and user accounts
            from one workspace.
          </p>
        </header>

        <section aria-labelledby="quick-actions-heading">
          <h2
            id="quick-actions-heading"
            className="mb-5 text-xl font-bold text-[#101F2B]"
          >
            Quick Actions
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <Link
              href="/admin/tickets"
              className="rounded-2xl border border-[#DCE6E9] bg-white p-6 shadow-sm transition hover:border-[#087F70] hover:shadow-md"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E4F4EF] text-[#087F70]">
                <svg
                  aria-hidden="true"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 5h16v14H4z" />
                  <path d="M8 9h8M8 13h8M8 17h5" />
                </svg>
              </div>

              <h3 className="text-lg font-bold text-[#101F2B]">
                Manage Support Tickets
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#526672]">
                Review employee support requests, update ticket
                statuses, and manage internal notes.
              </p>

              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#087F70]">
                View Tickets
                <span aria-hidden="true">→</span>
              </span>
            </Link>

            <Link
              href="/admin/assets"
              className="rounded-2xl border border-[#DCE6E9] bg-white p-6 shadow-sm transition hover:border-[#087F70] hover:shadow-md"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#E4F4EF] text-[#087F70]">
                <svg
                  aria-hidden="true"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="4" width="18" height="14" rx="2" />
                  <path d="M8 21h8M12 18v3" />
                </svg>
              </div>

              <h3 className="text-lg font-bold text-[#101F2B]">
                Manage IT Assets
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#526672]">
                View the asset inventory, register equipment,
                and manage employee assignments.
              </p>

              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#087F70]">
                View Assets
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          </div>
        </section>

        <section
          aria-labelledby="create-user-heading"
          className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-sm"
        >
          <div className="border-b border-[#E1E9EC] px-6 py-6 sm:px-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#087F70]">
              User Management
            </p>

            <h2
              id="create-user-heading"
              className="text-xl font-bold text-[#101F2B]"
            >
              Create User Account
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#526672]">
              Add a new employee or administrator account
              to IT ServiceDesk.
            </p>
          </div>

          <form
            onSubmit={handleCreateUser}
            noValidate
            className="space-y-6 px-6 py-7 sm:px-8"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="full-name" className={labelClass}>
                  Full Name
                </label>

                <input
                  id="full-name"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  autoComplete="name"
                  required
                  className={inputClass}
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClass}>
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  className={inputClass}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label htmlFor="role" className={labelClass}>
                  Account Role
                </label>

                <select
                  id="role"
                  value={role}
                  onChange={(event) =>
                    setRole(event.target.value as UserRole)
                  }
                  required
                  className={inputClass}
                >
                  <option value="Employee">Employee</option>
                  <option value="Administrator">
                    Administrator
                  </option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className={labelClass}>
                  Temporary Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                  aria-describedby="password-requirements"
                  className={inputClass}
                  placeholder="Enter temporary password"
                />
              </div>
            </div>

            <p
              id="password-requirements"
              className="rounded-xl bg-[#F4F7F8] px-4 py-3 text-sm leading-6 text-[#526672]"
            >
              Password must contain at least 8 characters,
              including an uppercase letter, lowercase letter,
              number, and special character.
            </p>

            {createUserError && (
              <p
                role="alert"
                className="rounded-xl border border-[#F1C9CF] bg-[#FFF1F2] px-4 py-3 text-sm text-[#B4233B]"
              >
                {createUserError}
              </p>
            )}

            {createUserMessage && (
              <p
                role="status"
                className="rounded-xl border border-[#B9E3D5] bg-[#E9F8F2] px-4 py-3 text-sm text-[#086B55]"
              >
                {createUserMessage}
              </p>
            )}

            <div className="flex justify-end border-t border-[#E1E9EC] pt-6">
              <button
                type="submit"
                disabled={isCreatingUser}
                className="rounded-xl bg-[#087F70] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#066759] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreatingUser
                  ? "Creating User..."
                  : "Create User"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
