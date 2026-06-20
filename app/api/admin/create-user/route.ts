import { requireAdminUser } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

const MIN_PASSWORD_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CreateUserBody = {
  email?: unknown;
  password?: unknown;
  serverName?: unknown;
  fullName?: unknown;
};

function parseCreateUserBody(body: CreateUserBody): {
  email: string;
  password: string;
  serverName: string;
  fullName: string | null;
} | { error: string } {
  if (
    typeof body.email !== "string" ||
    typeof body.password !== "string" ||
    typeof body.serverName !== "string"
  ) {
    return {
      error: "Email, password, and server name must be provided as strings.",
    };
  }

  const email = body.email.trim().toLowerCase();
  const password = body.password;
  const serverName = body.serverName.trim();
  const fullName =
    typeof body.fullName === "string" && body.fullName.trim()
      ? body.fullName.trim()
      : null;

  if (!email) {
    return { error: "Email is required." };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { error: "A valid email address is required." };
  }

  if (!password) {
    return { error: "Password is required." };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }

  if (!serverName) {
    return { error: "Server name is required." };
  }

  return { email, password, serverName, fullName };
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminUser(request);

  if (!authResult.ok) {
    return NextResponse.json(
      { success: false, error: authResult.message },
      { status: authResult.status },
    );
  }

  let body: CreateUserBody;

  try {
    body = (await request.json()) as CreateUserBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const parsed = parseCreateUserBody(body);

  if ("error" in parsed) {
    return NextResponse.json(
      { success: false, error: parsed.error },
      { status: 400 },
    );
  }

  try {
    const adminClient = getSupabaseAdminClient();
    const { data, error } = await adminClient.auth.admin.createUser({
      email: parsed.email,
      password: parsed.password,
      email_confirm: true,
      user_metadata: {
        role: "process_server",
        server_name: parsed.serverName,
        full_name: parsed.fullName,
      },
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, error: "User creation failed." },
        { status: 500 },
      );
    }

    const { error: profileError } = await adminClient.from("profiles").insert({
      id: data.user.id,
      email: parsed.email,
      server_name: parsed.serverName,
      full_name: parsed.fullName,
      role: "process_server",
    });

    if (profileError) {
      await adminClient.auth.admin.deleteUser(data.user.id);

      return NextResponse.json(
        {
          success: false,
          error: profileError.message.includes("profiles_server_name_unique")
            ? "A user with this server name already exists."
            : profileError.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully.",
        user: {
          id: data.user.id,
          email: data.user.email,
          serverName: parsed.serverName,
          fullName: parsed.fullName,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while creating the user.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}