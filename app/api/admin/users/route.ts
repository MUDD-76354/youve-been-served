import { requireAdminUser } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

type ProfileRow = {
  id: string;
  email: string;
  server_name: string;
  full_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

export async function GET(request: NextRequest) {
  const authResult = await requireAdminUser(request);

  if (!authResult.ok) {
    return NextResponse.json(
      { success: false, error: authResult.message },
      { status: authResult.status },
    );
  }

  try {
    const adminClient = getSupabaseAdminClient();
    const { data, error } = await adminClient
      .from("profiles")
      .select("id, email, server_name, full_name, role, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    const users = ((data ?? []) as ProfileRow[]).map((row) => ({
      id: row.id,
      email: row.email,
      serverName: row.server_name,
      fullName: row.full_name,
      role: row.role,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while loading users.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}