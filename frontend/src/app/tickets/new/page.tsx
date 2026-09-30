"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";
import {
  createTicket,
  type TicketCategory,
  type TicketPriority,
} from "@/lib/api/tickets";

const categories: TicketCategory[] = [
  "Hardware Issue",
  "Software Issue",
  "Network Issue",
  "Access Request",
  "Other",
];

const priorities: TicketPriority[] = [
  "Low",
  "Medium",
  "High",
];

export default function NewTicketPage() {
  const router = useRouter();

  const [isCheckingSession, setIsCheckingSession] =
    useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] =
    useState<TicketCategory>("Hardware Issue");
  const [priority, setPriority] =
    useState<TicketPriority | "">("");

  const [error, setError] = useState("");

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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const ticket = await createTicket({
        title,
        description,
        category,
        priority: priority || null,
      });

      router.push(`/tickets/${ticket.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create ticket."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingSession) {
    return (
      <main className="p-8">
        <p>Checking session...</p>
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

      <div className="mt-6">
        <h1 className="text-3xl font-bold">
          Create Support Ticket
        </h1>

        <p className="mt-2 text-gray-600">
          Submit a new request to the IT support team.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded border border-red-300 bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6"
      >
        <div>
          <label
            htmlFor="title"
            className="block font-medium"
          >
            Title
          </label>

          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            required
            maxLength={100}
            className="mt-2 w-full rounded border px-3 py-2"
          />

          <p className="mt-1 text-sm text-gray-500">
            {title.length}/100 characters
          </p>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block font-medium"
          >
            Description
          </label>

          <textarea
            id="description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            required
            maxLength={1000}
            rows={6}
            className="mt-2 w-full rounded border px-3 py-2"
          />

          <p className="mt-1 text-sm text-gray-500">
            {description.length}/1000 characters
          </p>
        </div>

        <div>
          <label
            htmlFor="category"
            className="block font-medium"
          >
            Category
          </label>

          <select
            id="category"
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value as TicketCategory
              )
            }
            className="mt-2 w-full rounded border px-3 py-2"
          >
            {categories.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="priority"
            className="block font-medium"
          >
            Priority
          </label>

          <select
            id="priority"
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target.value as
                  | TicketPriority
                  | ""
              )
            }
            className="mt-2 w-full rounded border px-3 py-2"
          >
            <option value="">
              No priority
            </option>

            {priorities.map((option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Creating..."
            : "Create Ticket"}
        </button>
      </form>
    </main>
  );
}