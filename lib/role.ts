export type UserRole = "process_server" | "admin";

export const USER_ROLE_STORAGE_KEY = "youve-been-served-user-role";

export const ROLE_LABELS: Record<UserRole, string> = {
  process_server: "Process Server (User)",
  admin: "Admin",
};

export function getStoredRole(): UserRole | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = localStorage.getItem(USER_ROLE_STORAGE_KEY);

  if (value === "process_server" || value === "admin") {
    return value;
  }

  return null;
}

export function storeRole(role: UserRole): void {
  localStorage.setItem(USER_ROLE_STORAGE_KEY, role);
}

export function clearStoredRole(): void {
  localStorage.removeItem(USER_ROLE_STORAGE_KEY);
}

export function getPortalPathForRole(role: UserRole): string {
  return role === "admin" ? "/admin" : "/mobile";
}

export function canAccessRoute(
  role: UserRole | null,
  pathname: string,
): boolean {
  if (!role) {
    return pathname === "/";
  }

  if (pathname === "/") {
    return true;
  }

  if (pathname.startsWith("/admin")) {
    return role === "admin";
  }

  if (pathname.startsWith("/mobile")) {
    return role === "process_server";
  }

  return true;
}