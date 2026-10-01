"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";
import {
  getTicket,
  type Ticket,
} from "@/lib/api/tickets";

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
        <p>Loading ticket...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link
        href="/tickets"
        className="text-blue-600 hover:underline"
      >
        ← Back to My Tickets
      </Link>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded border border-red-300 bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {!error && ticket && (
        <>
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              Ticket #{ticket.id}
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              {ticket.title}
            </h1>
          </div>

          <div className="mt-8 rounded border p-6">
            <dl className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="font-semibold">
                  Status
                </dt>
                <dd className="mt-1">
                  {ticket.status}
                </dd>
              </div>

              <div>
                <dt className="font-semibold">
                  Priority
                </dt>
                <dd className="mt-1">
                  {ticket.priority ?? "Not set"}
                </dd>
              </div>

              <div>
                <dt className="font-semibold">
                  Category
                </dt>
                <dd className="mt-1">
                  {ticket.category}
                </dd>
              </div>

              <div>
                <dt className="font-semibold">
                  Created
                </dt>
                <dd className="mt-1">
                  {new Date(
                    ticket.created_at
                  ).toLocaleString()}
                </dd>
              </div>

              <div>
                <dt className="font-semibold">
                  Last Updated
                </dt>
                <dd className="mt-1">
                  {new Date(
                    ticket.updated_at
                  ).toLocaleString()}
                </dd>
              </div>
            </dl>

            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold">
                Description
              </h2>

              <p className="mt-2 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          </div>
        </>
      )}
    </main>
  );
}