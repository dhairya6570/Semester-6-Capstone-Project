import type { SupabaseClient } from "@supabase/supabase-js";

export async function getTicketNotes(
  supabase: SupabaseClient,
  ticketId: number
) {
  const { data: notes, error } = await supabase
    .from("ticket_notes")
    .select(
      "id, ticket_id, admin_user_id, note_text, created_at"
    )
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      notes: null,
      error,
    };
  }

  return {
    notes,
    error: null,
  };
}