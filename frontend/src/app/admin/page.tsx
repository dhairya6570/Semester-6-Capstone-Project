"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, type UserRole } from "@/lib/api/auth";
import { createUser } from "@/lib/api/users";

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

  async function handleCreateUser(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setCreateUserError("");
    setCreateUserMessage("");
    setIsCreatingUser(true);

    try {
      const response = await createUser({
        fullName,
        email,
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
      <main>
        <p>Checking session...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Admin Dashboard</h1>
      <p>Manage IT assets, support tickets, and users.</p>

      <section aria-labelledby="create-user-heading">
        <h2 id="create-user-heading">Create User Account</h2>

        <form onSubmit={handleCreateUser}>
          <div>
            <label htmlFor="full-name">Full Name</label>
            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as UserRole)
              }
              required
            >
              <option value="Employee">Employee</option>
              <option value="Administrator">
                Administrator
              </option>
            </select>
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
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

          {createUserError && (
            <p role="alert">{createUserError}</p>
          )}

          {createUserMessage && (
            <p role="status">{createUserMessage}</p>
          )}

          <button
            type="submit"
            disabled={isCreatingUser}
          >
            {isCreatingUser
              ? "Creating User..."
              : "Create User"}
          </button>
        </form>
      </section>
    </main>
  );
}