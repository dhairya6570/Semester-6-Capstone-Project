
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateCreateTicket } from "@/lib/validation/ticket";
import { validateTicketQuery } from "@/lib/validation/ticket-query";
import { createTicket } from "@/lib/tickets/create-ticket";
import { getTickets } from "@/lib/tickets/get-tickets";
import { logServerError } from "@/lib/errors/logger";

export async function GET(request: Request) {
  try {
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

    const { searchParams } = new URL(request.url);
    const validation = validateTicketQuery(searchParams);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { tickets, error } = await getTickets(
      supabase,
      validation.data
    );

    if (error || !tickets) {
      logServerError(error, {
        route: "/api/tickets",
        operation: "GET",
      });

      return NextResponse.json(
        { error: "Tickets could not be loaded." },
        { status: 500 }
      );
    }

    return NextResponse.json({ tickets });
  } catch (error) {
    logServerError(error, {
      route: "/api/tickets",
      operation: "GET",
    });

    return NextResponse.json(
      { error: "Tickets could not be loaded." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
      logServerError(error, {
        route: "/api/tickets",
        operation: "POST",
      });

      return NextResponse.json(
        { error: "Ticket could not be created." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ticket },
      { status: 201 }
    );
  } catch (error) {
    logServerError(error, {
      route: "/api/tickets",
      operation: "POST",
    });

    return NextResponse.json(
      { error: "Ticket could not be created." },
      { status: 500 }
    );
  }
}
