
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";
import {
  createTicket,
  type TicketCategory,
  type TicketPriority,
} from "@/lib/api/tickets";
import AppShell from "@/components/layout/AppShell";

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

const inputClass =
  "mt-2 w-full rounded-xl border border-[#C8D6DC] bg-white px-4 py-3 text-[#101F2B] outline-none transition focus:border-[#087F70] focus:ring-2 focus:ring-[#087F70]/20";

const labelClass =
  "block text-sm font-semibold text-[#243B49]";

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

    if (!title.trim()) {
      setError("Please enter a ticket title.");
      return;
    }

    if (title.trim().length > 100) {
      setError("Ticket title must not exceed 100 characters.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a ticket description.");
      return;
    }

    if (description.trim().length > 1000) {
      setError(
        "Ticket description must not exceed 1000 characters."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const ticket = await createTicket({
        title: title.trim(),
        description: description.trim(),
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
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7F8] px-5">
        <p role="status" className="text-sm text-[#405462]">
          Checking session...
        </p>
      </main>
    );
  }

  return (
    <AppShell role="Employee">
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <Link
            href="/tickets"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#087F70] hover:underline"
          >
            <span aria-hidden="true">←</span>
            Back to My Tickets
          </Link>

          <p className="mb-2 mt-7 text-sm font-semibold uppercase tracking-widest text-[#087F70]">
            Employee Workspace
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[#101F2B] sm:text-4xl">
            Create Support Ticket
          </h1>

          <p className="mt-3 text-base text-[#526672]">
            Describe your IT issue or request assistance
            from the support team.
          </p>
        </header>

        <section
          aria-labelledby="ticket-form-heading"
          className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-sm"
        >
          <div className="border-b border-[#E1E9EC] px-6 py-6 sm:px-8">
            <h2
              id="ticket-form-heading"
              className="text-xl font-bold text-[#101F2B]"
            >
              Ticket Information
            </h2>

            <p className="mt-2 text-sm text-[#526672]">
              Complete the details below to submit your request.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-7 px-6 py-7 sm:px-8"
          >
            <div>
              <label htmlFor="title" className={labelClass}>
                Ticket Title
                <span className="ml-1 text-[#B4233B]">*</span>
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
                aria-describedby="title-help"
                className={inputClass}
                placeholder="Briefly describe the issue"
              />

              <p
                id="title-help"
                className="mt-2 text-xs text-[#526672]"
              >
                {title.length}/100 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className={labelClass}
              >
                Description
                <span className="ml-1 text-[#B4233B]">*</span>
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
                aria-describedby="description-help"
                className={inputClass}
                placeholder="Explain the issue, when it started, and any relevant details"
              />

              <p
                id="description-help"
                className="mt-2 text-xs text-[#526672]"
              >
                {description.length}/1000 characters
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="category"
                  className={labelClass}
                >
                  Category
                  <span className="ml-1 text-[#B4233B]">*</span>
                </label>

                <select
                  id="category"
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value as TicketCategory
                    )
                  }
                  className={inputClass}
                >
                  {categories.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className={labelClass}
                >
                  Priority
                  <span className="ml-2 text-xs font-normal text-[#526672]">
                    Optional
                  </span>
                </label>

                <select
                  id="priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value as TicketPriority | ""
                    )
                  }
                  className={inputClass}
                >
                  <option value="">No priority</option>

                  {priorities.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-[#F1C9CF] bg-[#FFF1F2] px-4 py-3 text-sm text-[#B4233B]"
              >
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-[#E1E9EC] pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/tickets"
                className="inline-flex items-center justify-center rounded-xl border border-[#C8D6DC] bg-white px-6 py-3 text-sm font-semibold text-[#243B49] transition hover:bg-[#F4F7F8]"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-[#087F70] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#066759] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Creating Ticket..."
                  : "Create Ticket"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
