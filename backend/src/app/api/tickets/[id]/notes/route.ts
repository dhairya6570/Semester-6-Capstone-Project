
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdministrator } from "@/lib/auth/roles";
import { getTicket } from "@/lib/tickets/get-ticket";
import { getTicketNotes } from "@/lib/tickets/get-ticket-notes";
import { createTicketNote } from "@/lib/tickets/create-ticket-note";
import { validateTicketNote } from "@/lib/validation/ticket";
import { logServerError } from "@/lib/errors/logger";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

const ROUTE = "/api/tickets/[id]/notes";

function internalError() {
  return NextResponse.json(
    { error: "An unexpected server error occurred." },
    { status: 500 }
  );
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const ticketId = Number(id);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
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

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError) {
      logServerError(profileError, {
        route: ROUTE,
        operation: "GET_PROFILE_LOOKUP",
      });

      return internalError();
    }

    if (!profile || !isAdministrator(profile.role)) {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    const { ticket, error: ticketError } = await getTicket(
      supabase,
      ticketId
    );

    if (ticketError) {
      logServerError(ticketError, {
        route: ROUTE,
        operation: "GET_TICKET",
      });

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

    const { notes, error } = await getTicketNotes(
      supabase,
      ticketId
    );

    if (error) {
      logServerError(error, {
        route: ROUTE,
        operation: "GET_NOTES",
      });

      return NextResponse.json(
        { error: "Ticket notes could not be loaded." },
        { status: 500 }
      );
    }

    return NextResponse.json({ notes });
  } catch (error) {
    logServerError(error, {
      route: ROUTE,
      operation: "GET_UNEXPECTED",
    });

    return internalError();
  }
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const ticketId = Number(id);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
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

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError) {
      logServerError(profileError, {
        route: ROUTE,
        operation: "POST_PROFILE_LOOKUP",
      });

      return internalError();
    }

    if (!profile || !isAdministrator(profile.role)) {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    const { ticket, error: ticketError } = await getTicket(
      supabase,
      ticketId
    );

    if (ticketError) {
      logServerError(ticketError, {
        route: ROUTE,
        operation: "POST_TICKET_LOOKUP",
      });

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
      !("noteText" in body)
    ) {
      return NextResponse.json(
        { error: "Note text is required." },
        { status: 400 }
      );
    }

    const validation = validateTicketNote(
      (body as { noteText: unknown }).noteText
    );

    if (!validation.valid || !validation.noteText) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { note, error } = await createTicketNote(
      supabase,
      ticketId,
      user.id,
      validation.noteText
    );

    if (error || !note) {
      logServerError(
        error ?? new Error("MissingNoteResult"),
        {
          route: ROUTE,
          operation: "CREATE_NOTE",
        }
      );

      return NextResponse.json(
        { error: "Ticket note could not be created." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Ticket note added successfully.",
        note,
      },
      { status: 201 }
    );
  } catch (error) {
    logServerError(error, {
      route: ROUTE,
      operation: "POST_UNEXPECTED",
    });

    return internalError();
  }
}
