import { NextRequest, NextResponse } from "next/server";
import { validateLoginCredentials } from "@/lib/validation/login";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const credentials = validateLoginCredentials(
    body.email,
    body.password
  );

  if (!credentials) {
    return NextResponse.json(
      {
        error: "Email and password are required.",
      },
      {
        status: 400,
      }
    );
  }

  return NextResponse.json({
    message: "Login credentials are valid.",
    email: credentials.email,
  });
}