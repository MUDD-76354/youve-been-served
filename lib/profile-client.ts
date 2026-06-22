import { PROCESS_SERVER_ROLE } from "@/lib/profiles";
import { normalizeRole } from "@/lib/role";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/lib/profiles";

type ProfileRow = {
  id: string;
  email: string;
  server_name: string;
  full_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

function mapProfile(row: ProfileRow): UserProfile {
  const role = normalizeRole(row.role) ?? row.role.trim().toLowerCase();

  return {
    id: row.id,
    email: row.email,
    serverName: row.server_name,
    fullName: row.full_name,
    role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function queryProfile(
  column: "id" | "email",
  value: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, server_name, full_name, role, created_at, updated_at")
    .eq(column, value)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapProfile(data as ProfileRow);
}

export async function fetchUserProfile(
  userId: string,
  email?: string | null,
): Promise<UserProfile | null> {
  const profileById = await queryProfile("id", userId);

  if (profileById) {
    return profileById;
  }

  const normalizedEmail = email?.trim().toLowerCase();

  if (normalizedEmail) {
    return queryProfile("email", normalizedEmail);
  }

  return null;
}

export async function fetchProcessServerNameSuggestions(): Promise<string[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("server_name")
    .eq("role", PROCESS_SERVER_ROLE);

  if (error) {
    throw new Error(error.message);
  }

  const names = new Set<string>();

  for (const row of data ?? []) {
    const serverName = (row as Pick<ProfileRow, "server_name">).server_name?.trim();
    if (serverName) {
      names.add(serverName);
    }
  }

  return Array.from(names).sort((a, b) => a.localeCompare(b));
}