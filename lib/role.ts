import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/profiles";

export type ProfileRole = "admin" | "process_server" | "user";

export type PortalRole = "admin" | "process_server";

export const ROLE_LABELS: Record<PortalRole, string> = {
  process_server: "Process Server",
  admin: "Admin",
};

export function normalizeRole(
  role: string | null | undefined,
): ProfileRole | null {
  if (!role) {
    return null;
  }

  const normalized = role.trim().toLowerCase();

  if (
    normalized === "admin" ||
    normalized === "process_server" ||
    normalized === "user"
  ) {
    return normalized;
  }

  return null;
}

export function getMetadataRole(user: User | null | undefined): string | null {
  if (!user) {
    return null;
  }

  const role = user.app_metadata?.role ?? user.user_metadata?.role;
  return typeof role === "string" ? role.trim().toLowerCase() : null;
}

export function isAdminRole(
  profile: UserProfile | null | undefined,
  user?: User | null,
): boolean {
  if (normalizeRole(profile?.role) === "admin") {
    return true;
  }

  return getMetadataRole(user) === "admin";
}

export function isMobileRole(profile: UserProfile | null | undefined): boolean {
  const role = normalizeRole(profile?.role);
  return role === "process_server" || role === "user";
}

export function getPortalPathForAuth(
  profile: UserProfile | null,
  user?: User | null,
): string | null {
  if (isAdminRole(profile, user)) {
    return "/admin";
  }

  if (isMobileRole(profile)) {
    return "/mobile";
  }

  return null;
}

export function canAccessAdminPortal(
  profile: UserProfile | null | undefined,
  user?: User | null,
): boolean {
  return isAdminRole(profile, user);
}

export function canAccessMobilePortal(
  profile: UserProfile | null | undefined,
): boolean {
  return isMobileRole(profile);
}