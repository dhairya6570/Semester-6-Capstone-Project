
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TicketQueryOptions } from "@/lib/validation/ticket-query";

export async function getTickets(
  supabase: SupabaseClient,
  options?: TicketQueryOptions
) {
  let query = supabase
    .from("tickets")
    .select(
      "id, user_id, title, description, category, priority, status, created_at"
    );

  if (options?.statuses.length) {
    query = query.in("status", options.statuses);
  }

  if (options?.search) {
    // Escape LIKE wildcards so searches are treated as literal text.
    const search = options.search.replace(
      /[%_\\]/g,
      "\\$&"
    );

    query = query.ilike("title", `%${search}%`);
  }

  query = query.order("created_at", {
    ascending: options?.sort === "asc",
  });

  const { data: tickets, error } = await query;

  if (error) {
    return {
      tickets: null,
      error,
    };
  }

  return {
    tickets,
    error: null,
  };
}
