
import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/client";
import { logServerError } from "@/lib/errors/logger";

export async function GET() {
  try {
    const supabase = createSupabaseClient();

    const { error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) {
      logServerError(error, {
        route: "/api/health",
        operation: "GET",
      });

      return NextResponse.json(
        {
          status: "error",
          database: "disconnected",
          message: "Service temporarily unavailable.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "ok",
      database: "connected",
      message: "Backend successfully connected to Supabase.",
    });
  } catch (error) {
    logServerError(error, {
      route: "/api/health",
      operation: "GET",
    });

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message: "Service temporarily unavailable.",
      },
      { status: 500 }
    );
  }
}
