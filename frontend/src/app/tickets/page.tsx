
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";
import { getTickets, type Ticket } from "@/lib/api/tickets";
import AppShell from "@/components/layout/AppShell";

function getStatusClass(status: string) {
  switch (status) {
    case "Open":
      return "bg-[#E7F0FF] text-[#2458A6]";
    case "In Progress":
      return "bg-[#FFF3DB] text-[#8B5B12]";
    case "Resolved":
      return "bg-[#E4F4EF] text-[#086B55]";
    case "Closed":
      return "bg-[#E9EEF1] text-[#435662]";
    default:
      return "bg-[#E9EEF1] text-[#435662]";
  }
}

function getPriorityClass(priority: string | null) {
  switch (priority) {
    case "High":
      return "bg-[#FFF0F1] text-[#B4233B]";
    case "Medium":
      return "bg-[#FFF3DB] text-[#8B5B12]";
    case "Low":
      return "bg-[#E4F4EF] text-[#086B55]";
    default:
      return "bg-[#E9EEF1] text-[#435662]";
  }
}

export default function TicketsPage() {
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTickets() {
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

        setIsAuthorized(true);

        const ticketData = await getTickets();
        setTickets(ticketData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load tickets."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadTickets();
  }, [router]);

  if (!isAuthorized) {
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
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#087F70]">
              Employee Workspace
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#101F2B] sm:text-4xl">
              My Support Tickets
            </h1>

            <p className="mt-3 text-base text-[#526672]">
              View your submitted IT support requests and track
              their progress.
            </p>
          </div>

          <Link
            href="/tickets/new"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#087F70] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#066759]"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Ticket
          </Link>
        </header>

        <section
          aria-labelledby="ticket-list-heading"
          className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E1E9EC] px-6 py-5">
            <h2
              id="ticket-list-heading"
              className="text-lg font-bold text-[#101F2B]"
            >
              Submitted Tickets
            </h2>

            {!isLoading && !error && (
              <span className="rounded-full bg-[#E4F4EF] px-3 py-1 text-xs font-semibold text-[#086B55]">
                {tickets.length}{" "}
                {tickets.length === 1 ? "Ticket" : "Tickets"}
              </span>
            )}
          </div>

          {error && (
            <div className="p-6">
              <p
                role="alert"
                className="rounded-xl border border-[#F1C9CF] bg-[#FFF1F2] px-4 py-3 text-sm text-[#B4233B]"
              >
                {error}
              </p>
            </div>
          )}

          {isLoading && (
            <div className="px-6 py-12 text-center">
              <p role="status" className="text-sm text-[#526672]">
                Loading your support tickets...
              </p>
            </div>
          )}

          {!isLoading && !error && tickets.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E4F4EF] text-[#087F70]">
                <svg
                  aria-hidden="true"
                  className="h-8 w-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 5h16v14H4z" />
                  <path d="M8 9h8M8 13h8M8 17h5" />
                </svg>
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#101F2B]">
                No support tickets yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#526672]">
                You haven&apos;t submitted any IT support requests.
                Create your first ticket when you need assistance.
              </p>

              <Link
                href="/tickets/new"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#087F70] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#066759]"
              >
                Create Your First Ticket
              </Link>
            </div>
          )}

          {!isLoading && !error && tickets.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-[#F4F7F8] text-xs uppercase tracking-wider text-[#526672]">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Ticket ID
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Title
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Category
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Priority
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E1E9EC]">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="transition-colors hover:bg-[#F8FAFB]"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#526672]">
                        #{ticket.id}
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="font-semibold text-[#087F70] hover:underline"
                        >
                          {ticket.title}
                        </Link>
                      </td>

                      <td className="px-5 py-4 text-[#405462]">
                        {ticket.category}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority ?? "Not set"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            ticket.status
                          )}`}
                        >
                          {ticket.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-[#526672]">
                        {new Date(
                          ticket.created_at
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
