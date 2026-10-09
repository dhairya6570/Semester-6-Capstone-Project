import type { SupabaseClient } from "@supabase/supabase-js";

export async function deleteTicket(
  supabase: SupabaseClient,
  ticketId: number
) {
  const { data: ticket, error } = await supabase
    .from("tickets")
    .delete()
    .eq("id", ticketId)
    .select("id")
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