
import { NextRequest, NextResponse } from "next/server";
import { validateLoginCredentials } from "@/lib/validation/login";
import { loginUser } from "@/lib/auth/login";
import { logServerError } from "@/lib/errors/logger";

export async function POST(request: NextRequest) {
  try {
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
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;

    const credentials = validateLoginCredentials(
      input.email,
      input.password
    );

    if (!credentials) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const result = await loginUser(
      credentials.email,
      credentials.password
    );

    if (result.error) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Login successful.",
      user: {
        id: result.user?.id,
        email: result.user?.email,
      },
    });
  } catch (error) {
    logServerError(error, {
      route: "/api/auth/login",
      operation: "LOGIN_UNEXPECTED",
    });

    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
