import { NextRequest, NextResponse } from "next/server";
import { validateLoginCredentials } from "@/lib/validation/login";
import { loginUser } from "@/lib/auth/login";

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

  const result = await loginUser(
  credentials.email,
  credentials.password
);

if (result.error) {
  return NextResponse.json(
    {
      error: "Invalid email or password.",
    },
    {
      status: 401,
    }
  );
}

return NextResponse.json({
  message: "Login successful.",
  user: {
    id: result.user?.id,
    email: result.user?.email,
  },
});

}