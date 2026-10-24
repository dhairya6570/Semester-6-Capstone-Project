"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";
import { getTicket, type Ticket } from "@/lib/api/tickets";
import AppShell from "@/components/layout/AppShell";

function getStatusClasses(status: string) {
  switch (status) {
    case "Open":
      return "bg-blue-100 text-blue-800";
    case "In Progress":
      return "bg-amber-100 text-amber-800";
    case "Resolved":
      return "bg-emerald-100 text-emerald-800";
    case "Closed":
      return "bg-slate-200 text-slate-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

function getPriorityClasses(priority: string | null) {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-800";
    case "Medium":
      return "bg-amber-100 text-amber-800";
    case "Low":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-slate-200 text-slate-800";
  }
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTicket() {
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

        const id = Number(params.id);

        if (!Number.isInteger(id) || id <= 0) {
          setError("Invalid ticket ID.");
          return;
        }

        const ticketData = await getTicket(id);
        setTicket(ticketData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load ticket."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadTicket();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <main className="p-8">
        <p role="status">Loading ticket...</p>
      </main>
    );
  }

  return (
    <AppShell role="Employee">
      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mb-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-[#087f70]">
            Employee Workspace
          </p>

          {!error && ticket && (
            <>
              <p className="mb-2 text-sm font-semibold text-[#526772]">
                Ticket #{ticket.id}
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-[#101f2b] sm:text-4xl">
                {ticket.title}
              </h1>

              <p className="mt-3 text-base text-[#526772]">
                View the information and current progress of
                your support request.
              </p>
            </>
          )}

          {error && (
            <h1 className="text-3xl font-bold text-[#101f2b]">
              Ticket Details
            </h1>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-800"
          >
            {error}
          </p>
        )}

        {!error && ticket && (
          <section
            aria-labelledby="ticket-overview-heading"
            className="overflow-hidden rounded-2xl border border-[#dfe7e9] bg-white shadow-sm"
          >
            <div className="border-b border-[#dfe7e9] px-6 py-6 sm:px-8">
              <h2
                id="ticket-overview-heading"
                className="text-xl font-bold text-[#101f2b]"
              >
                Ticket Overview
              </h2>

              <p className="mt-1 text-sm text-[#526772]">
                Details and current status of this support ticket.
              </p>
            </div>

            <dl className="grid gap-x-8 gap-y-8 px-6 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
              <div>
                <dt className="mb-3 text-sm font-semibold text-[#526772]">
                  Ticket Status
                </dt>

                <dd>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusClasses(
                      ticket.status
                    )}`}
                  >
                    {ticket.status}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="mb-3 text-sm font-semibold text-[#526772]">
                  Priority
                </dt>

                <dd>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getPriorityClasses(
                      ticket.priority
                    )}`}
                  >
                    {ticket.priority ?? "Not set"}
                  </span>
                </dd>
              </div>

              <div>
                <dt className="mb-3 text-sm font-semibold text-[#526772]">
                  Category
                </dt>

                <dd className="text-base text-[#101f2b]">
                  {ticket.category}
                </dd>
              </div>

              <div>
                <dt className="mb-3 text-sm font-semibold text-[#526772]">
                  Created On
                </dt>

                <dd className="text-base text-[#101f2b]">
                  {new Date(ticket.created_at).toLocaleString()}
                </dd>
              </div>

              <div>
                <dt className="mb-3 text-sm font-semibold text-[#526772]">
                  Last Updated
                </dt>

                <dd className="text-base text-[#101f2b]">
                  {new Date(ticket.updated_at).toLocaleString()}
                </dd>
              </div>

              <div>
                <dt className="mb-3 text-sm font-semibold text-[#526772]">
                  Ticket ID
                </dt>

                <dd className="text-base text-[#101f2b]">
                  #{ticket.id}
                </dd>
              </div>
            </dl>

            <div className="border-t border-[#dfe7e9] px-6 py-8 sm:px-8">
              <h2 className="text-lg font-bold text-[#101f2b]">
                Issue Description
              </h2>

              <p className="mt-4 whitespace-pre-wrap break-words leading-7 text-[#334e5b]">
                {ticket.description}
              </p>
            </div>
          </section>
        )}

        <div className="mt-7">
          <Link
            href="/tickets"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#cbdde1] bg-white px-5 py-3 text-sm font-semibold text-[#101f2b] transition-colors hover:bg-[#eaf3f2]"
          >
            ← Back to My Tickets
          </Link>
        </div>
      </main>
    </AppShell>
  );
}