
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";
import AppShell from "@/components/layout/AppShell";

export default function DashboardPage() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getSession();

        if (!session.authenticated || !session.user) {
          router.replace("/login");
          return;
        }

        if (session.user.role !== "Employee") {
          router.replace("/login");
          return;
        }

        setIsCheckingSession(false);
      } catch {
        router.replace("/login");
      }
    }

    checkSession();
  }, [router]);

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
    <AppShell role="Employee">
      <div className="space-y-8">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#087F70]">
            Employee Workspace
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[#101F2B] sm:text-4xl">
            Employee Dashboard
          </h1>

          <p className="mt-3 text-base text-[#526672]">
            Welcome to IT ServiceDesk. Manage your support tickets
            and view your assigned IT assets.
          </p>
        </div>

        <section
          aria-label="Quick actions"
          className="grid gap-5 md:grid-cols-2"
        >
          <Link
            href="/tickets/new"
            className="group rounded-2xl border border-[#DCE6E9] bg-white p-6 shadow-sm transition hover:border-[#087F70] hover:shadow-md"
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
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </div>

            <h2 className="text-lg font-bold text-[#101F2B]">
              Create Support Ticket
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#526672]">
              Report an IT issue or request technical assistance
              from the support team.
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#087F70]">
              Create Ticket
              <span aria-hidden="true">→</span>
            </span>
          </Link>

          <Link
            href="/tickets"
            className="group rounded-2xl border border-[#DCE6E9] bg-white p-6 shadow-sm transition hover:border-[#087F70] hover:shadow-md"
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

            <h2 className="text-lg font-bold text-[#101F2B]">
              My Support Tickets
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#526672]">
              View your submitted tickets and check their
              current status and details.
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#087F70]">
              View Tickets
              <span aria-hidden="true">→</span>
            </span>
          </Link>

          <Link
            href="/my/assets"
            className="group rounded-2xl border border-[#DCE6E9] bg-white p-6 shadow-sm transition hover:border-[#087F70] hover:shadow-md"
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

            <h2 className="text-lg font-bold text-[#101F2B]">
              My Assigned Assets
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#526672]">
              View the laptops, monitors, and other IT equipment
              currently assigned to you.
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#087F70]">
              View My Assets
              <span aria-hidden="true">→</span>
            </span>
          </Link>

          <Link
            href="/profile"
            className="group rounded-2xl border border-[#DCE6E9] bg-white p-6 shadow-sm transition hover:border-[#087F70] hover:shadow-md"
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
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
            </div>

            <h2 className="text-lg font-bold text-[#101F2B]">
              My Profile
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#526672]">
              View your account information and manage
              your password.
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#087F70]">
              Open Profile
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
