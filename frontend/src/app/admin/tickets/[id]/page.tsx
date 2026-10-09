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

export default function AdminTicketDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [notes, setNotes] = useState<TicketNote[]>([]);
  const [selectedStatus, setSelectedStatus] =
    useState<TicketStatus>("Open");
  const [noteText, setNoteText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
    if (!ticket) {
      return;
    }

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
      setSuccessMessage(
        "Ticket status updated successfully."
      );
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
    if (!ticket) {
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsAddingNote(true);

    try {
      const newNote = await addTicketNote(
        ticket.id,
        noteText
      );

      setNotes((currentNotes) => [
        ...currentNotes,
        newNote,
      ]);
      setNoteText("");
      setSuccessMessage(
        "Internal note added successfully."
      );
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
    if (!ticket) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete Ticket #${ticket.id}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

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
      setIsDeleting(false);
    }
  }

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
        href="/admin/tickets"
        className="text-blue-600 hover:underline"
      >
        ← Back to Support Tickets
      </Link>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded border border-red-300 bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {successMessage && (
        <p
          role="status"
          className="mt-6 rounded border border-green-300 bg-green-50 p-4 text-green-700"
        >
          {successMessage}
        </p>
      )}

      {ticket && (
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
                Update Status
              </h2>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                <div>
                  <label
                    htmlFor="ticket-status"
                    className="block text-sm font-medium"
                  >
                    Ticket status
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
                    className="mt-1 rounded border px-3 py-2"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">
                      In Progress
                    </option>
                    <option value="Resolved">
                      Resolved
                    </option>
                    <option value="Closed">
                      Closed
                    </option>
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
                  className="rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving
                    ? "Saving..."
                    : "Save Status"}
                </button>
              </div>
            </div>

            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold">
                Description
              </h2>

              <p className="mt-2 whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold">
                Internal Notes
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Internal notes are visible only to administrators.
              </p>

              {notes.length === 0 ? (
                <p className="mt-4 text-gray-600">
                  No internal notes have been added.
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded border bg-gray-50 p-4"
                    >
                      <p className="whitespace-pre-wrap">
                        {note.note_text}
                      </p>

                      <p className="mt-2 text-sm text-gray-500">
                        {new Date(
                          note.created_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <label
                  htmlFor="internal-note"
                  className="block font-medium"
                >
                  Add internal note
                </label>

                <textarea
                  id="internal-note"
                  value={noteText}
                  onChange={(event) =>
                    setNoteText(event.target.value)
                  }
                  rows={4}
                  disabled={isAddingNote || isDeleting}
                  className="mt-2 w-full rounded border px-3 py-2"
                  placeholder="Enter an internal note..."
                />

                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={
                    isAddingNote ||
                    isDeleting ||
                    noteText.trim().length === 0
                  }
                  className="mt-3 rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAddingNote
                    ? "Adding..."
                    : "Add Note"}
                </button>
              </div>
            </div>

            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold">
                Delete Ticket
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Permanently delete this support ticket.
                This action cannot be undone.
              </p>

              <button
                type="button"
                onClick={handleDeleteTicket}
                disabled={isDeleting}
                className="mt-4 rounded bg-red-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting
                  ? "Deleting..."
                  : "Delete Ticket"}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}