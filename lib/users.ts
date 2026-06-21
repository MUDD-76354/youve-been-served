import { getAccessToken } from "@/lib/auth-client";
import { ROLE_PROTECTION_ENABLED } from "@/lib/role-protection";
import type {
  CreateUserProfileInput,
  CreateUserProfileResult,
  UserProfile,
} from "@/lib/profiles";

export type FetchUsersResult =
  | {
      success: true;
      users: UserProfile[];
    }
  | {
      success: false;
      error: string;
    };

function buildAdminHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function fetchAllUserProfiles(): Promise<FetchUsersResult> {
  const token = await getAccessToken();

  if (ROLE_PROTECTION_ENABLED && !token) {
    return {
      success: false,
      error: "You must sign in as an admin to view users.",
    };
  }

  const response = await fetch("/api/admin/users", {
    headers: buildAdminHeaders(token),
  });

  const data = (await response.json()) as
    | { success: true; users: UserProfile[] }
    | { success: false; error: string };

  return data;
}

export async function createUserProfile(
  input: CreateUserProfileInput,
): Promise<CreateUserProfileResult> {
  const token = await getAccessToken();

  if (ROLE_PROTECTION_ENABLED && !token) {
    return {
      success: false,
      error: "You must sign in as an admin to create users.",
    };
  }

  const response = await fetch("/api/admin/create-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAdminHeaders(token),
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      serverName: input.serverName,
      fullName: input.fullName,
    }),
  });

  const data = (await response.json()) as CreateUserProfileResult;
  return data;
}