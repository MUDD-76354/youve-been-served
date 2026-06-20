import type { UserProfile } from "@/lib/profiles";

export const PROFILE_STORAGE_KEY = "youve-been-served-profile";

export function getStoredProfile(): UserProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(PROFILE_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function storeProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function clearStoredProfile(): void {
  localStorage.removeItem(PROFILE_STORAGE_KEY);
}