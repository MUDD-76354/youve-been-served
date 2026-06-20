import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const REMEMBER_ME_STORAGE_KEY = "youve-been-served-remember-me";

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.",
    );
  }

  return { url, key };
}

const { url, key } = getSupabaseEnv();

let client: SupabaseClient | null = null;
let clientMode: "local" | "session" | null = null;

function getClientMode(): "local" | "session" {
  if (typeof window === "undefined") {
    return "local";
  }

  return localStorage.getItem(REMEMBER_ME_STORAGE_KEY) !== "false"
    ? "local"
    : "session";
}

function getAuthStorage(): Storage | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return getClientMode() === "local"
    ? window.localStorage
    : window.sessionStorage;
}

function clearSupabaseAuthTokens(storage: Storage): void {
  for (let index = storage.length - 1; index >= 0; index -= 1) {
    const storageKey = storage.key(index);

    if (storageKey?.startsWith("sb-") && storageKey.endsWith("-auth-token")) {
      storage.removeItem(storageKey);
    }
  }
}

export function getRememberMePreference(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  return localStorage.getItem(REMEMBER_ME_STORAGE_KEY) !== "false";
}

export function setRememberMePreference(remember: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(REMEMBER_ME_STORAGE_KEY, remember ? "true" : "false");
  resetSupabaseClient();
}

export function resetSupabaseClient(): void {
  client = null;
  clientMode = null;
}

export function prepareAuthPersistence(remember: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  setRememberMePreference(remember);

  if (remember) {
    clearSupabaseAuthTokens(window.sessionStorage);
  } else {
    clearSupabaseAuthTokens(window.localStorage);
  }

  resetSupabaseClient();
}

export function getSupabaseClient(): SupabaseClient {
  const mode = getClientMode();

  if (client && clientMode === mode) {
    return client;
  }

  client = createClient(url, key, {
    auth: {
      storage: getAuthStorage(),
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  clientMode = mode;

  return client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const activeClient = getSupabaseClient();
    const value = activeClient[property as keyof SupabaseClient];

    if (typeof value === "function") {
      return value.bind(activeClient);
    }

    return value;
  },
});