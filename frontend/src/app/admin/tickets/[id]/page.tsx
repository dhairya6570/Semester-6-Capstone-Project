
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";
import {
  addTicketNote,
  deleteTicket,
  getTicket,
  getTicketNotes,
  updateTicketStatus,
  type Ticket,
  type TicketNote,
  type TicketStatus,
} from "@/lib/api/tickets";
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

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function AdminTicketDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [notes, setNotes] = useState<TicketNote[]>([]);
  const [selectedStatus, setSelectedStatus] =
    useState<TicketStatus>("Open");
  const [noteText, setNoteText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadTicket() {
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

        setIsAuthorized(true);

        const id = Number(params.id);

        if (!Number.isInteger(id) || id <= 0) {
          setError("Invalid ticket ID.");
          return;
        }

        const ticketData = await getTicket(id);
        const notesData = await getTicketNotes(id);

        setTicket(ticketData);
        setSelectedStatus(ticketData.status);
        setNotes(notesData);
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

  async function handleStatusUpdate() {
    if (!ticket) return;

    setError("");
    setSuccessMessage("");
    setIsSaving(true);

    try {
      const updatedTicket = await updateTicketStatus(
        ticket.id,
        selectedStatus
      );

      setTicket(updatedTicket);
      setSelectedStatus(updatedTicket.status);
      setSuccessMessage("Ticket status updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update ticket status."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddNote() {
    if (!ticket || noteText.trim().length === 0) return;

    setError("");
    setSuccessMessage("");
    setIsAddingNote(true);

    try {
      const newNote = await addTicketNote(ticket.id, noteText);

      setNotes((currentNotes) => [...currentNotes, newNote]);
      setNoteText("");
      setSuccessMessage("Internal note added successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to add ticket note."
      );
    } finally {
      setIsAddingNote(false);
    }
  }

  async function handleDeleteTicket() {
    if (!ticket) return;

    setError("");
    setSuccessMessage("");
    setIsDeleting(true);

    try {
      await deleteTicket(ticket.id);
      router.push("/admin/tickets");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete ticket."
      );
      setShowDeleteConfirmation(false);
    } finally {
      setIsDeleting(false);
    }
  }

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
    <AppShell role="Administrator">
      <div className="mx-auto w-full max-w-6xl space-y-7">
        <header>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#087F70]">
            Administrator Workspace
          </p>

          <p className="text-sm font-semibold text-[#526672]">
            {ticket ? `Ticket #${ticket.id}` : "Ticket Details"}
          </p>

          <h1 className="mt-2 break-words text-3xl font-bold tracking-tight text-[#101F2B] sm:text-4xl">
            {ticket?.title ?? "Support Ticket"}
          </h1>

          <p className="mt-3 text-base text-[#526672]">
            Review ticket information, update its status, and manage
            internal support notes.
          </p>
        </header>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-[#F1C9CF] bg-[#FFF1F2] px-5 py-4 text-sm text-[#B4233B]"
          >
            {error}
          </p>
        )}

        {successMessage && (
          <p
            role="status"
            className="rounded-xl border border-[#BDE4D6] bg-[#E4F4EF] px-5 py-4 text-sm text-[#086B55]"
          >
            {successMessage}
          </p>
        )}

        {isLoading && (
          <p role="status" className="text-sm text-[#526672]">
            Loading ticket details...
          </p>
        )}

        {!isLoading && ticket && (
          <>
            <section className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-sm">
              <div className="border-b border-[#E1E9EC] px-6 py-5 sm:px-8">
                <h2 className="text-xl font-bold text-[#101F2B]">
                  Ticket Overview
                </h2>
                <p className="mt-1 text-sm text-[#526672]">
                  Current information for this support request.
                </p>
              </div>

              <dl className="grid gap-7 px-6 py-7 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
                <div>
                  <dt className="mb-2 text-sm font-semibold text-[#526672]">
                    Status
                  </dt>
                  <dd>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusClass(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="mb-2 text-sm font-semibold text-[#526672]">
                    Priority
                  </dt>
                  <dd>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getPriorityClass(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority ?? "Not set"}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="mb-2 text-sm font-semibold text-[#526672]">
                    Category
                  </dt>
                  <dd className="text-[#101F2B]">
                    {ticket.category}
                  </dd>
                </div>

                <div>
                  <dt className="mb-2 text-sm font-semibold text-[#526672]">
                    Created On
                  </dt>
                  <dd className="text-[#101F2B]">
                    {formatDate(ticket.created_at)}
                  </dd>
                </div>

                <div>
                  <dt className="mb-2 text-sm font-semibold text-[#526672]">
                    Last Updated
                  </dt>
                  <dd className="text-[#101F2B]">
                    {formatDate(ticket.updated_at)}
                  </dd>
                </div>

                <div>
                  <dt className="mb-2 text-sm font-semibold text-[#526672]">
                    Ticket ID
                  </dt>
                  <dd className="text-[#101F2B]">
                    #{ticket.id}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-[#DCE6E9] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-[#101F2B]">
                Update Ticket Status
              </h2>
              <p className="mt-2 text-sm text-[#526672]">
                Change the progress of this support request.
              </p>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="w-full sm:max-w-xs">
                  <label
                    htmlFor="ticket-status"
                    className="mb-2 block text-sm font-semibold text-[#101F2B]"
                  >
                    Ticket Status
                  </label>

                  <select
                    id="ticket-status"
                    value={selectedStatus}
                    onChange={(event) =>
                      setSelectedStatus(
                        event.target.value as TicketStatus
                      )
                    }
                    disabled={isSaving || isDeleting}
                    className="min-h-12 w-full rounded-xl border border-[#CBDDE1] bg-white px-4 py-3 text-sm text-[#101F2B] focus:border-[#087F70] focus:outline-none focus:ring-2 focus:ring-[#087F70]/20 disabled:opacity-50"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={
                    isSaving ||
                    isDeleting ||
                    selectedStatus === ticket.status
                  }
                  className="min-h-12 rounded-xl bg-[#087F70] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#06695D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Status"}
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-[#DCE6E9] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-[#101F2B]">
                Issue Description
              </h2>

              <p className="mt-4 whitespace-pre-wrap break-words leading-7 text-[#405462]">
                {ticket.description}
              </p>
            </section>

            <section className="rounded-2xl border border-[#DCE6E9] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-[#101F2B]">
                Internal Notes
              </h2>

              <p className="mt-2 text-sm text-[#526672]">
                These notes are visible only to administrators.
              </p>

              <div className="mt-6 space-y-4">
                {notes.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#CBDDE1] bg-[#F8FAFB] px-5 py-6 text-sm text-[#526672]">
                    No internal notes have been added.
                  </div>
                ) : (
                  notes.map((note) => (
                    <article
                      key={note.id}
                      className="rounded-xl border border-[#E1E9EC] bg-[#F8FAFB] p-5"
                    >
                      <p className="whitespace-pre-wrap break-words leading-6 text-[#101F2B]">
                        {note.note_text}
                      </p>

                      <p className="mt-3 text-xs text-[#526672]">
                        {formatDate(note.created_at)}
                      </p>
                    </article>
                  ))
                )}
              </div>

              <div className="mt-7">
                <label
                  htmlFor="internal-note"
                  className="mb-2 block text-sm font-semibold text-[#101F2B]"
                >
                  Add Internal Note
                </label>

                <textarea
                  id="internal-note"
                  value={noteText}
                  onChange={(event) => setNoteText(event.target.value)}
                  rows={4}
                  disabled={isAddingNote || isDeleting}
                  placeholder="Enter an internal note..."
                  className="w-full resize-y rounded-xl border border-[#CBDDE1] bg-white px-4 py-3 text-sm text-[#101F2B] placeholder:text-[#647782] focus:border-[#087F70] focus:outline-none focus:ring-2 focus:ring-[#087F70]/20 disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={
                    isAddingNote ||
                    isDeleting ||
                    noteText.trim().length === 0
                  }
                  className="mt-4 min-h-12 rounded-xl bg-[#087F70] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#06695D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAddingNote ? "Adding..." : "Add Note"}
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-[#F1C9CF] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-bold text-[#B4233B]">
                Delete Ticket
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#526672]">
                Permanently delete this support ticket and its
                associated information. This action cannot be undone.
              </p>

              {!showDeleteConfirmation ? (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccessMessage("");
                    setShowDeleteConfirmation(true);
                  }}
                  disabled={isDeleting || isSaving || isAddingNote}
                  className="mt-5 min-h-12 rounded-xl border border-[#B4233B] px-6 py-3 text-sm font-semibold text-[#B4233B] transition-colors hover:bg-[#FFF1F2] disabled:opacity-50"
                >
                  Delete Ticket
                </button>
              ) : (
                <div className="mt-5 rounded-xl border border-[#F1C9CF] bg-[#FFF1F2] p-5">
                  <p className="font-semibold text-[#B4233B]">
                    Are you sure you want to delete Ticket #{ticket.id}?
                  </p>

                  <p className="mt-2 text-sm text-[#8F2638]">
                    This action is permanent and cannot be undone.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleDeleteTicket}
                      disabled={isDeleting}
                      className="min-h-11 rounded-xl bg-[#B4233B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#921C30] disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting..." : "Yes, Delete Ticket"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirmation(false)}
                      disabled={isDeleting}
                      className="min-h-11 rounded-xl border border-[#CBDDE1] bg-white px-5 py-2.5 text-sm font-semibold text-[#101F2B] hover:bg-[#F4F7F8] disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        <div>
          <Link
            href="/admin/tickets"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#CBDDE1] bg-white px-5 py-3 text-sm font-semibold text-[#101F2B] transition-colors hover:bg-[#EAF3F2]"
          >
            ← Back to Support Tickets
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
