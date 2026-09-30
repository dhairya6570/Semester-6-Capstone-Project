import type { SupabaseClient } from "@supabase/supabase-js";

export async function getTicket(
  supabase: SupabaseClient,
  ticketId: number
) {
  const { data: ticket, error } = await supabase
    .from("tickets")
    .select(
      "id, user_id, title, description, category, priority, status, created_at"
    )
    .eq("id", ticketId)
    .maybeSingle();

  if (error) {
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