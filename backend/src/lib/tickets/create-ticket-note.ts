import type { SupabaseClient } from "@supabase/supabase-js";

export async function createTicketNote(
  supabase: SupabaseClient,
  ticketId: number,
  adminUserId: string,
  noteText: string
) {
  const { data: note, error } = await supabase
    .from("ticket_notes")
    .insert({
      ticket_id: ticketId,
      admin_user_id: adminUserId,
      note_text: noteText,
    })
    .select(
      "id, ticket_id, admin_user_id, note_text, created_at"
    )
    .single();

  if (error || !note) {
    return {
      note: null,
      error,
    };
  }

  return {
    note,
    error: null,
  };
}