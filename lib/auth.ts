// TODO: Re-implement proper User/Admin role separation with working login

import { normalizeRole } from "@/lib/role";
import { ROLE_PROTECTION_ENABLED } from "@/lib/role-protection";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

type AuthFailure = {
  ok: false;
  status: 401 | 403;
  message: string;
};

type AuthSuccess = {
  ok: true;
  user: User;
};

export type AdminAuthResult = AuthFailure | AuthSuccess;

function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  return token || null;
}

async function isAdminUser(
  user: User,
  supabase: SupabaseClient,
): Promise<boolean> {
  const metadataRole = user.app_metadata?.role ?? user.user_metadata?.role;

  if (normalizeRole(metadataRole) === "admin") {
    return true;
  }

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const profileRole = (data as { role: string } | null)?.role;
  return normalizeRole(profileRole) === "admin";
}

export async function requireAdminUser(
  request: NextRequest,
): Promise<AdminAuthResult> {
  // TODO: Re-enable proper authentication and role protection once the login flow is fixed.
  if (!ROLE_PROTECTION_ENABLED) {
    return {
      ok: true,
      user: {
        id: "auth-protection-disabled",
        email: "auth-protection-disabled@local",
      } as User,
    };
  }

  const token = getBearerToken(request);

  if (!token) {
    return {
      ok: false,
      status: 401,
      message: "Authentication required. Provide a valid Bearer token.",
    };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.",
    );
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return {
      ok: false,
      status: 401,
      message: "Invalid or expired authentication token.",
    };
  }

  if (!(await isAdminUser(data.user, supabase))) {
    return {
      ok: false,
      status: 403,
      message: "Admin role required to access this resource.",
    };
  }

  return {
    ok: true,
    user: data.user,
  };
}