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
  return {
    id: row.id,
    email: row.email,
    serverName: row.server_name,
    fullName: row.full_name,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, server_name, full_name, role, created_at, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapProfile(data as ProfileRow);
}