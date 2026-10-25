
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, login, logout } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState("");
  const sessionCheckVersion = useRef(0);

  useEffect(() => {
    const version = ++sessionCheckVersion.current;

    async function checkSession() {
      try {
        const session = await getSession();

        if (version !== sessionCheckVersion.current) {
          return;
        }

        if (session.authenticated && session.user) {
          setIsSignedIn(true);
          setCurrentRole(session.user.role ?? "");
          setSuccessMessage(
            `Already signed in as ${session.user.email} (${session.user.role}).`,
          );
        } else {
          setIsSignedIn(false);
          setCurrentRole("");
        }
      } catch {
        if (version === sessionCheckVersion.current) {
          setError("Unable to verify the current session.");
        }
      }
    }

    checkSession();

    return () => {
      sessionCheckVersion.current = version + 1;
    };
  }, []);

  async function handleLogout() {
    sessionCheckVersion.current++;
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      await logout();

      setEmail("");
      setPassword("");
      setIsSignedIn(false);
      setCurrentRole("");
      setSuccessMessage("Logout successful.");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to log out.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    sessionCheckVersion.current++;

    setError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      await login(email.trim(), password);

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
      setError(
        error instanceof Error ? error.message : "Unable to log in.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const dashboardPath =
    currentRole === "Administrator" ? "/admin" : "/dashboard";

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-2">
      <section className="relative flex flex-col justify-between overflow-hidden bg-[#101F2B] px-6 py-10 text-white sm:px-12 lg:min-h-screen lg:px-16 lg:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-1/4 h-96 w-96 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 top-1/3 h-64 w-64 rounded-full border border-white/10"
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#087F70] text-xl font-bold text-white">
            IT
          </div>
          <span className="text-xl font-bold tracking-tight">
            IT ServiceDesk
          </span>
        </div>

        <div className="relative z-10 my-12 max-w-lg lg:my-0">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#D6A35B]/40 bg-[#D6A35B]/10 px-4 py-2 text-sm font-medium text-[#F1D4A8]">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-[#D6A35B]"
            />
            Your IT workspace
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl xl:text-6xl">
            IT support,
            <span className="block text-[#6CD5BE]">
              simplified.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-8 text-[#C7D5DB] sm:text-lg">
            One secure place to manage support tickets, track IT
            assets, and stay connected with your IT team.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#087F70]/30 text-[#8CE8D4]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                  />
                </svg>
              </div>
              <h2 className="font-semibold text-white">
                Support tickets
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#C7D5DB]">
                Submit requests and follow their progress.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#D6A35B]/20 text-[#F1D4A8]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                >
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="14"
                    rx="2"
                  />
                  <path
                    strokeLinecap="round"
                    d="M8 21h8M12 18v3"
                  />
                </svg>
              </div>
              <h2 className="font-semibold text-white">
                Asset management
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#C7D5DB]">
                Keep your assigned equipment organized.
              </p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-sm text-[#C7D5DB]">
          IT Asset &amp; Support Ticket Management System
        </p>
      </section>

      <section className="flex min-h-[600px] items-center justify-center bg-[#F4F7F8] px-5 py-12 sm:px-10 lg:min-h-screen">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-[#087F70]">
              Welcome back
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-[#172C37] sm:text-4xl">
              Sign in to your account
            </h2>
            <p className="mt-3 leading-7 text-[#526772]">
              Enter your credentials to access your workspace.
            </p>
          </div>

          <form
            method="post"
            noValidate
            onSubmit={handleSubmit}
            className="rounded-2xl border border-[#DFE7E9] bg-white p-6 shadow-[0_16px_50px_-28px_rgba(16,31,43,0.35)] sm:p-8"
          >
            <div className="mb-6">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#172C37]"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                aria-invalid={Boolean(error && !email.trim())}
                aria-describedby={error ? "login-error" : undefined}
                disabled={isLoading}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-[#C9D6DB] bg-white px-4 py-3.5 text-[#172C37] placeholder:text-[#617580] focus:border-[#087F70] focus:outline-none focus:ring-2 focus:ring-[#087F70]/20 disabled:bg-gray-100"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#172C37]"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                aria-invalid={Boolean(error && !password)}
                aria-describedby={error ? "login-error" : undefined}
                disabled={isLoading}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-[#C9D6DB] bg-white px-4 py-3.5 text-[#172C37] placeholder:text-[#617580] focus:border-[#087F70] focus:outline-none focus:ring-2 focus:ring-[#087F70]/20 disabled:bg-gray-100"
              />
            </div>

            {error && (
              <p
                id="login-error"
                role="alert"
                className="mb-5 text-sm"
              >
                {error}
              </p>
            )}

            {successMessage && (
              <p role="status" className="mb-5 text-sm">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || isSignedIn}
              className="flex w-full items-center justify-center rounded-xl bg-[#087F70] px-5 py-3.5 font-semibold text-white transition-colors hover:bg-[#066759] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#087F70] disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            {isSignedIn && (
              <button
                type="button"
                onClick={() => router.push(dashboardPath)}
                className="mt-3 w-full rounded-xl border border-[#087F70] px-5 py-3 font-semibold text-[#087F70] transition-colors hover:bg-[#E8F7F2]"
              >
                Go to Dashboard
              </button>
            )}

            {isSignedIn && (
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoading}
                className="mt-3 w-full rounded-xl border border-[#C9D6DB] px-5 py-3 font-semibold text-[#526772] transition-colors hover:bg-[#F4F7F8]"
              >
                Log Out
              </button>
            )}
          </form>

          <p className="mt-8 text-center text-sm leading-6 text-[#526772]">
            Access is restricted to authorized employees and
            IT administrators.
          </p>
        </div>
      </section>
    </main>
  );
}
