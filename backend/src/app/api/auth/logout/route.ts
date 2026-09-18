import { NextResponse } from "next/server";
import { logoutUser } from "@/lib/auth/logout";

export async function POST() {
  const result = await logoutUser();

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Unable to log out.",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({
    message: "Logout successful.",
  });
}