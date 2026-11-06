import {
  TICKET_STATUSES,
  type TicketStatus,
} from "./ticket";

export type TicketSortOrder = "asc" | "desc";

export interface TicketQueryOptions {
  statuses: TicketStatus[];
  search: string;
  sort: TicketSortOrder;
}

export type TicketQueryValidationResult =
  | { valid: true; data: TicketQueryOptions }
  | { valid: false; error: string };

export function validateTicketQuery(
  params: URLSearchParams
): TicketQueryValidationResult {
  const rawStatuses = params.getAll("status");
  const rawSearch = params.get("search") ?? "";
  const rawSort = params.get("sort") ?? "desc";

  const statuses = rawStatuses.flatMap((value) =>
    value.split(",")
  );

  if (
    statuses.some(
      (status) =>
        !TICKET_STATUSES.includes(status as TicketStatus)
    )
  ) {
    return {
      valid: false,
      error: "Invalid ticket status filter.",
    };
  }

  const search = rawSearch.trim();

  if (search.length > 100) {
    return {
      valid: false,
      error: "Search must be 100 characters or fewer.",
    };
  }

  if (rawSort !== "asc" && rawSort !== "desc") {
    return {
      valid: false,
      error: "Invalid ticket sort order.",
    };
  }

  return {
    valid: true,
    data: {
      statuses: [...new Set(statuses)] as TicketStatus[],
      search,
      sort: rawSort,
    },
  };
}
