import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTicket } from "@/lib/tickets/get-ticket";
import { updateTicketStatus } from "@/lib/tickets/update-ticket-status";
import { validateTicketStatus } from "@/lib/validation/ticket";
import { isAdministrator } from "@/lib/auth/roles";

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

export async function PATCH(
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !isAdministrator(profile.role)
  ) {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 }
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
    !("status" in body)
  ) {
    return NextResponse.json(
      { error: "Invalid ticket status." },
      { status: 400 }
    );
  }

  const validation = validateTicketStatus(
    (body as { status: unknown }).status
  );

  if (!validation.valid || !validation.status) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  const { ticket, error } = await updateTicketStatus(
    supabase,
    ticketId,
    validation.status
  );

  if (error) {
    return NextResponse.json(
      { error: "Ticket status could not be updated." },
      { status: 500 }
    );
  }

  if (!ticket) {
    return NextResponse.json(
      { error: "Ticket not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Ticket status updated successfully.",
    ticket,
  });
}