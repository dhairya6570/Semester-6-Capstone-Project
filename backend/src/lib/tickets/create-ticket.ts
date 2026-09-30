import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateTicketInput } from "@/lib/validation/ticket";

export async function createTicket(
  supabase: SupabaseClient,
  userId: string,
  input: CreateTicketInput
) {
  const { data: ticket, error } = await supabase
    .from("tickets")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
    })
    .select(
      "id, user_id, title, description, category, priority, status, created_at"
    )
    .single();

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