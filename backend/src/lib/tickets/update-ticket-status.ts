import type { SupabaseClient } from "@supabase/supabase-js";
import type { TicketStatus } from "@/lib/validation/ticket";

export async function updateTicketStatus(
  supabase: SupabaseClient,
  ticketId: number,
  status: TicketStatus
) {
  const { data: ticket, error } = await supabase
    .from("tickets")
    .update({
      status,
    })
    .eq("id", ticketId)
    .select(
      "id, user_id, title, description, category, priority, status, created_at, updated_at, status_changed_at"
    )
    .maybeSingle();

  if (error || !ticket) {
    return {
      ticket: null,
      error,
    };
  }

  return {
    ticket,
    error: null,
  };
}