"use client";

/**
 * Full AuthProvider implementation — not currently wired up.
 * TODO: Re-enable once the site is stable by restoring this in AuthProvider.tsx.
 */

import {
  clearStoredProfile,
  getStoredProfile,
  storeProfile,
} from "@/lib/auth-storage";
import { signInWithEmail, signOut as signOutClient } from "@/lib/auth-client";
import { fetchUserProfile } from "@/lib/profile-client";
import type { UserProfile } from "@/lib/profiles";
import { ROLE_PROTECTION_ENABLED } from "@/lib/role-protection";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfileForUser(userId: string): Promise<UserProfile | null> {
  const profile = await fetchUserProfile(userId);

  if (profile) {
    storeProfile(profile);
  } else {
    clearStoredProfile();
  }

  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(ROLE_PROTECTION_ENABLED);

  const refreshAuth = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const nextSession = data.session ?? null;
    setSession(nextSession);

    if (!nextSession?.user) {
      setProfile(null);
      clearStoredProfile();
      return;
    }

    const nextProfile = await loadProfileForUser(nextSession.user.id);
    setProfile(nextProfile);
  }, []);

  useEffect(() => {
    if (!ROLE_PROTECTION_ENABLED) {
      setIsLoading(false);
      return;
    }

    let active = true;

    async function initialize() {
      setProfile(getStoredProfile());
      await refreshAuth();

      if (active) {
        setIsLoading(false);
      }
    }

    void initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);

      if (!nextSession?.user) {
        setProfile(null);
        clearStoredProfile();
        return;
      }

      const nextProfile = await loadProfileForUser(nextSession.user.id);
      setProfile(nextProfile);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [refreshAuth]);

  const signIn = useCallback(
    async (email: string, password: string, rememberMe = true) => {
      const { error } = await signInWithEmail(email, password, rememberMe);

      if (error) {
        return { error };
      }

      await refreshAuth();
      return { error: null };
    },
    [refreshAuth],
  );

  const signOut = useCallback(async () => {
    await signOutClient();
    setSession(null);
    setProfile(null);
    clearStoredProfile();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      isLoading,
      signIn,
      signOut,
      refreshAuth,
    }),
    [session, profile, isLoading, signIn, signOut, refreshAuth],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}