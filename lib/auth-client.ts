import { prepareAuthPersistence, supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signInWithEmail(
  email: string,
  password: string,
  rememberMe = true,
): Promise<{ error: string | null }> {
  prepareAuthPersistence(rememberMe);

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}