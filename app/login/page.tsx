// TODO: Re-implement proper User/Admin role separation with working login

"use client";

import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { getErrorMessage } from "@/lib/errors";
import { getRememberMePreference } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const inputClassName =
  "mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClassName = "block text-sm font-medium text-gray-700";

export default function LoginPage() {
  const { showError, showSuccess } = useToast();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    setRememberMe(getRememberMePreference());
  }, []);

  // Role-based auto-redirect disabled while RBAC is turned off.
  // useEffect(() => {
  //   if (isLoading || !session) return;
  //   const redirectPath = getPortalPathForAuth(profile, user);
  //   if (redirectPath) router.replace(redirectPath);
  // }, [isLoading, session, profile, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error: signInError } = await signIn(email, password, rememberMe);

      if (signInError) {
        setError(signInError);
        showError(signInError, "Sign in failed");
        return;
      }

      const message =
        "Signed in successfully. Open either portal below — role checks are temporarily disabled.";
      setSuccessMessage(message);
      showSuccess(message, "Signed in");
    } catch (err) {
      const message = getErrorMessage(err, "Failed to sign in.");
      setError(message);
      showError(message, "Sign in failed");
    } finally {
      setIsSubmitting(false);
    }
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
            Optional sign-in. Both portals are open without role checks.
          </p>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Role-based redirects are disabled. Use the portal links below.
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {successMessage ? (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
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

          <div className="mt-6 flex flex-col items-center gap-2 text-sm">
            <Link href="/admin" className="font-medium text-blue-600 hover:text-blue-800">
              Admin Portal
            </Link>
            <Link href="/mobile" className="font-medium text-blue-600 hover:text-blue-800">
              Field Portal
            </Link>
            <Link href="/" className="font-medium text-gray-600 hover:text-gray-900">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}