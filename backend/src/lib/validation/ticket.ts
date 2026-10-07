export const TICKET_CATEGORIES = [
  "Hardware Issue",
  "Software Issue",
  "Network Issue",
  "Access Request",
  "Other",
] as const;

export const TICKET_PRIORITIES = [
  "Low",
  "Medium",
  "High",
] as const;

export const TICKET_STATUSES = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
] as const;

export type TicketCategory =
  (typeof TICKET_CATEGORIES)[number];

export type TicketPriority =
  (typeof TICKET_PRIORITIES)[number];

export type TicketStatus =
  (typeof TICKET_STATUSES)[number];

export interface CreateTicketInput {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority | null;
}

export interface CreateTicketValidationResult {
  valid: boolean;
  error?: string;
  data?: CreateTicketInput;
}

export function validateCreateTicket(
  title: unknown,
  description: unknown,
  category: unknown,
  priority: unknown
): CreateTicketValidationResult {
  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof category !== "string"
  ) {
    return {
      valid: false,
      error: "Title, description, and category are required.",
    };
  }

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();

  if (!trimmedTitle || !trimmedDescription || !category) {
    return {
      valid: false,
      error: "Title, description, and category are required.",
    };
  }

  if (trimmedTitle.length > 100) {
    return {
      valid: false,
      error: "Title must be 100 characters or fewer.",
    };
  }

  if (trimmedDescription.length > 1000) {
    return {
      valid: false,
      error: "Description must be 1000 characters or fewer.",
    };
  }

  if (
    !TICKET_CATEGORIES.includes(
      category as TicketCategory
    )
  ) {
    return {
      valid: false,
      error: "Invalid ticket category.",
    };
  }

  if (
    priority !== null &&
    priority !== undefined &&
    priority !== "" &&
    !TICKET_PRIORITIES.includes(
      priority as TicketPriority
    )
  ) {
    return {
      valid: false,
      error: "Invalid ticket priority.",
    };
  }

  return {
    valid: true,
    data: {
      title: trimmedTitle,
      description: trimmedDescription,
      category: category as TicketCategory,
      priority:
        priority === null ||
        priority === undefined ||
        priority === ""
          ? null
          : (priority as TicketPriority),
    },
  };
}

export interface UpdateTicketStatusValidationResult {
  valid: boolean;
  error?: string;
  status?: TicketStatus;
}

export function validateTicketStatus(
  status: unknown
): UpdateTicketStatusValidationResult {
  if (
    typeof status !== "string" ||
    !TICKET_STATUSES.includes(status as TicketStatus)
  ) {
    return {
      valid: false,
      error: "Invalid ticket status.",
    };
  }

  return {
    valid: true,
    status: status as TicketStatus,
  };
}