import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateCreateUser } from "@/lib/validation/create-user";
import { isAdministrator } from "@/lib/auth/roles";
import { createUserAccount } from "@/lib/auth/create-user";

export async function POST(request: NextRequest) {
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

  const body = await request.json();

  const validation = validateCreateUser(
    body.fullName,
    body.email,
    body.role,
    body.password
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
}