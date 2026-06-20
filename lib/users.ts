import { getAccessToken } from "@/lib/auth-client";
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

export async function fetchAllUserProfiles(): Promise<FetchUsersResult> {
  const token = await getAccessToken();

  if (!token) {
    return {
      success: false,
      error: "You must sign in as an admin to view users.",
    };
  }

  const response = await fetch("/api/admin/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
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

  if (!token) {
    return {
      success: false,
      error: "You must sign in as an admin to create users.",
    };
  }

  const response = await fetch("/api/admin/create-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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