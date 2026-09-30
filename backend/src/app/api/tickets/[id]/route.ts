import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTicket } from "@/lib/tickets/get-ticket";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  const { id } = await context.params;
  const ticketId = Number(id);

  if (
    !Number.isInteger(ticketId) ||
    ticketId <= 0
  ) {
    return NextResponse.json(
      { error: "Invalid ticket ID." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const { ticket, error } = await getTicket(
    supabase,
    ticketId
  );

  if (error) {
    return NextResponse.json(
      { error: "Ticket could not be loaded." },
      { status: 500 }
    );
  }

  if (!ticket) {
    return NextResponse.json(
      { error: "Ticket not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ticket });
}