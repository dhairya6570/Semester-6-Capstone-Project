
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateCreateUser } from "@/lib/validation/create-user";
import { isAdministrator } from "@/lib/auth/roles";
import { createUserAccount } from "@/lib/auth/create-user";
import { logServerError } from "@/lib/errors/logger";

const ROUTE = "/api/admin/users";

function internalError() {
  return NextResponse.json(
    { error: "An unexpected server error occurred." },
    { status: 500 }
  );
}

export async function POST(request: NextRequest) {
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
        { error: "Invalid user details." },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;

    const validation = validateCreateUser(
      input.fullName,
      input.email,
      input.role,
      input.password
    );

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const result = await createUserAccount(validation.data);

    if (result.error || !result.user) {
      const duplicateEmail =
        result.error?.message
          ?.toLowerCase()
          .includes("already been registered") ||
        result.error?.message
          ?.toLowerCase()
          .includes("already registered");

      if (duplicateEmail) {
        return NextResponse.json(
          { error: "A user with this email already exists." },
          { status: 409 }
        );
      }

      logServerError(
        result.error ?? new Error("MissingUserResult"),
        {
          route: ROUTE,
          operation: "CREATE_USER",
        }
      );

      return NextResponse.json(
        { error: "User account could not be created." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "User account created successfully.",
        user: {
          id: result.user.id,
          email: result.user.email,
          fullName: validation.data.fullName,
          role: validation.data.role,
        },
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

export async function GET() {
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

    const { data: employees, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "Employee")
      .order("full_name", { ascending: true });

    if (error) {
      logServerError(error, {
        route: ROUTE,
        operation: "GET_EMPLOYEES",
      });

      return NextResponse.json(
        { error: "Unable to load employees." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { employees: employees ?? [] },
      { status: 200 }
    );
  } catch (error) {
    logServerError(error, {
      route: ROUTE,
      operation: "GET_UNEXPECTED",
    });

    return internalError();
  }
}
