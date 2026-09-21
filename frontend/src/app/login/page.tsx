"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, login, logout } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getSession();

        if (session.authenticated && session.user) {
          setSuccessMessage(
            `Already signed in as ${session.user.email} (${session.user.role}).`,
          );
        }
      } catch {
        setError("Unable to verify the current session.");
      }
    }

    checkSession();
  }, []);

    async function handleLogout() {
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      await logout();

      setEmail("");
      setPassword("");
      setSuccessMessage("Logout successful.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to log out."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
        await login(email, password);

        const session = await getSession();

        if (!session.authenticated || !session.user) {
            throw new Error("Unable to verify authenticated session.");
        }

        if (session.user.role === "Administrator") {
            router.replace("/admin");
            return;
        }

        if (session.user.role === "Employee") {
            router.replace("/dashboard");
            return;
        }

        throw new Error("Unable to determine user role.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to log in.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <h1>Login</h1>
      <p>Sign in to the IT Asset & Support Ticket Management System.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error && <p role="alert">{error}</p>}

        {successMessage && <p role="status">{successMessage}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </button>

        <button type="button" onClick={handleLogout} disabled={isLoading}>
          Log Out
        </button>
      </form>
    </main>
  );
}
