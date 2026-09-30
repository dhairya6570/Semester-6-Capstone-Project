import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateCreateTicket } from "@/lib/validation/ticket";
import { createTicket } from "@/lib/tickets/create-ticket";
import { getTickets } from "@/lib/tickets/get-tickets";


export async function GET() {
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

  const { tickets, error } = await getTickets(supabase);

  if (error || !tickets) {
    return NextResponse.json(
      { error: "Tickets could not be loaded." },
      { status: 500 }
    );
  }

  return NextResponse.json({ tickets });
}

export async function POST(request: Request) {
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

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const ticketData = body as Record<string, unknown>;

  const validation = validateCreateTicket(
    ticketData.title,
    ticketData.description,
    ticketData.category,
    ticketData.priority
  );

  if (!validation.valid || !validation.data) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  const { ticket, error } = await createTicket(
    supabase,
    user.id,
    validation.data
  );

  if (error || !ticket) {
    return NextResponse.json(
      { error: "Ticket could not be created." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { ticket },
    { status: 201 }
  );
}