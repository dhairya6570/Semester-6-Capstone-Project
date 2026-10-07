import { API_URL } from "@/lib/api/config";

export type TicketCategory =
  | "Hardware Issue"
  | "Software Issue"
  | "Network Issue"
  | "Access Request"
  | "Other";

export type TicketPriority =
  | "Low"
  | "Medium"
  | "High";

export type TicketStatus =
  | "Open"
  | "In Progress"
  | "Resolved"
  | "Closed";

export interface Ticket {
  id: number;
  user_id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority | null;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  status_changed_at?: string;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority | null;
}

export async function getTickets(): Promise<Ticket[]> {
  const response = await fetch(`${API_URL}/api/tickets`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Unable to load tickets."
    );
  }

  return data.tickets;
}

export async function getTicket(
  id: number
): Promise<Ticket> {
  const response = await fetch(
    `${API_URL}/api/tickets/${id}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Unable to load ticket."
    );
  }

  return data.ticket;
}

export async function createTicket(
  input: CreateTicketInput
): Promise<Ticket> {
  const response = await fetch(`${API_URL}/api/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Unable to create ticket."
    );
  }

  return data.ticket;
}

export async function updateTicketStatus(
  id: number,
  status: TicketStatus
): Promise<Ticket> {
  const response = await fetch(
    `${API_URL}/api/tickets/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ status }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Unable to update ticket status."
    );
  }

  return data.ticket;
}