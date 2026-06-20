"use client";

import { useAuth } from "@/components/AuthProvider";
import LoadingSpinner from "@/components/mobile/LoadingSpinner";
import { useToast } from "@/components/ToastProvider";
import { fetchUserProfile } from "@/lib/profile-client";
import { getErrorMessage } from "@/lib/errors";
import { getPortalPathForAuth } from "@/lib/role";
import { getRememberMePreference, supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const inputClassName =
  "mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClassName = "block text-sm font-medium text-gray-700";

export default function LoginPage() {
  const router = useRouter();
  const { showError } = useToast();
  const { session, profile, user, isLoading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    setRememberMe(getRememberMePreference());
  }, []);

  useEffect(() => {
    if (isLoading || !session) {
      return;
    }

    const redirectPath = getPortalPathForAuth(profile, user);

    if (redirectPath) {
      router.replace(redirectPath);
    }
  }, [isLoading, session, profile, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: signInError } = await signIn(email, password, rememberMe);

      if (signInError) {
        setError(signInError);
        showError(signInError, "Sign in failed");
        return;
      }

      const { data } = await supabase.auth.getSession();
      const nextSession = data.session;

      if (!nextSession?.user) {
        const message = "Signed in, but no active session was found.";
        setError(message);
        showError(message, "Sign in failed");
        return;
      }

      const nextProfile = await fetchUserProfile(nextSession.user.id);
      const redirectPath = getPortalPathForAuth(nextProfile, nextSession.user);

      if (!redirectPath) {
        const message =
          "Your account does not have access to a portal. Contact an administrator.";
        setError(message);
        showError(message, "Access denied");
        return;
      }

      router.replace(redirectPath);
    } catch (err) {
      const message = getErrorMessage(err, "Failed to sign in.");
      setError(message);
      showError(message, "Sign in failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50 py-20">
        <LoadingSpinner className="h-8 w-8 text-blue-600" label="Loading" />
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image
            src="/Splash.png"
            alt="You've Been Served - Bohn & Associates"
            width={600}
            height={320}
            className="mx-auto rounded-lg shadow-lg"
            priority
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
          <p className="mt-1 text-sm text-gray-600">
            Use your Bohn &amp; Associates account credentials.
          </p>

          {error ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <label className={labelClassName}>
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClassName}
                autoComplete="email"
              />
            </label>

            <label className={labelClassName}>
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClassName}
                autoComplete="current-password"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Remember me
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link href="/" className="font-medium text-blue-600 hover:text-blue-800">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}