// TODO: Re-implement proper User/Admin role separation with working login

import { storeProfile } from "@/lib/auth-storage";
import { fetchUserProfile } from "@/lib/profile-client";
import type { UserProfile } from "@/lib/profiles";
import { getPortalPathForAuth } from "@/lib/role";
import { supabase } from "@/lib/supabase";

export type PostLoginResult =
  | {
      ok: true;
      redirectPath: string;
      profile: UserProfile | null;
    }
  | {
      ok: false;
      message: string;
      profile: UserProfile | null;
    };

/**
 * Role-based post-login redirect — disabled while RBAC is off.
 * Login page no longer calls this until role separation is restored.
 */
export async function resolvePostLoginRedirect(): Promise<PostLoginResult> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;

  if (!session?.user) {
    return {
      ok: false,
      message: "Signed in, but no active session was found.",
      profile: null,
    };
  }

  const profile = await fetchUserProfile(session.user.id, session.user.email);

  if (profile) {
    storeProfile(profile);
  }

  const redirectPath = getPortalPathForAuth(profile, session.user);

  if (!redirectPath) {
    const roleHint = profile?.role
      ? `Profile role: "${profile.role}".`
      : "No matching profile row was found.";

    return {
      ok: false,
      message: `Your account does not have access to a portal. ${roleHint} Contact an administrator.`,
      profile,
    };
  }

  return {
    ok: true,
    redirectPath,
    profile,
  };
}