"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";
import {
  getTickets,
  type Ticket,
} from "@/lib/api/tickets";

export default function AdminTicketsPage() {
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTickets() {
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

  if (isLoading) {
    return (
      <main className="p-8">
        <p>Loading tickets...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="mb-8">
        <Link
          href="/admin"
          className="text-blue-600 hover:underline"
        >
          ← Back to Admin Dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-bold">
          Support Tickets
        </h1>

        <p className="mt-2 text-gray-600">
          View and manage support tickets submitted by employees.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-6 rounded border border-red-300 bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {!error && tickets.length === 0 && (
        <div className="rounded border p-6">
          <p>No support tickets have been submitted yet.</p>
        </div>
      )}

      {!error && tickets.length > 0 && (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-t"
                >
                  <td className="p-4">
                    #{ticket.id}
                  </td>

                  <td className="p-4">
                    <Link
                      href={`/admin/tickets/${ticket.id}`}
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {ticket.title}
                    </Link>
                  </td>

                  <td className="p-4">
                    {ticket.category}
                  </td>

                  <td className="p-4">
                    {ticket.priority ?? "Not set"}
                  </td>

                  <td className="p-4">
                    {ticket.status}
                  </td>

                  <td className="p-4">
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
    </main>
  );
}