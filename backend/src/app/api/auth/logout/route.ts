
import { NextResponse } from "next/server";
import { logoutUser } from "@/lib/auth/logout";
import { logServerError } from "@/lib/errors/logger";

export async function POST() {
  try {
    const result = await logoutUser();

    if (!result.success) {
      logServerError(
        new Error("LogoutFailed"),
        {
          route: "/api/auth/logout",
          operation: "LOGOUT",
        }
      );

      return NextResponse.json(
        { error: "Unable to log out." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Logout successful.",
    });
  } catch (error) {
    logServerError(error, {
      route: "/api/auth/logout",
      operation: "LOGOUT_UNEXPECTED",
    });

    return NextResponse.json(
      { error: "An unexpected server error occurred." },
      { status: 500 }
    );
  }
}
