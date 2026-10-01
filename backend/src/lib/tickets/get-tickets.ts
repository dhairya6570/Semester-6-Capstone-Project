import type { SupabaseClient } from "@supabase/supabase-js";

export async function getTickets(
  supabase: SupabaseClient
) {
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select(
      "id, user_id, title, description, category, priority, status, created_at"
    )
    .order("created_at", { ascending: false });

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