"use client";

import { useAuth } from "@/components/AuthProvider";
import LoadingSpinner from "@/components/mobile/LoadingSpinner";
import { getPortalPathForAuth } from "@/lib/role";
import { ROLE_PROTECTION_ENABLED } from "@/lib/role-protection";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RoleSelection() {
  const router = useRouter();
  const { session, profile, user, isLoading, signOut } = useAuth();

  useEffect(() => {
    // TODO: Re-enable proper authentication and role protection once the login flow is fixed.
    if (!ROLE_PROTECTION_ENABLED) {
      return;
    }

    if (isLoading || !session) {
      return;
    }

    const redirectPath = getPortalPathForAuth(profile, user);

    if (redirectPath) {
      router.replace(redirectPath);
    }
  }, [isLoading, session, profile, user, router]);

  if (ROLE_PROTECTION_ENABLED && isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50 py-20">
        <LoadingSpinner className="h-8 w-8 text-blue-600" label="Loading" />
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-6 py-10">
      <div className="w-full max-w-4xl text-center">
        <div className="mb-8">
          <Image
            src="/Splash.png"
            alt="You've Been Served - Bohn & Associates"
            width={900}
            height={500}
            className="mx-auto rounded-lg shadow-lg"
            priority
          />
        </div>

        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          Bohn &amp; Associates
        </h1>
        <p className="mb-2 text-lg text-gray-600">
          Process Serving Tracking System
        </p>
        <p className="mb-8 text-sm text-gray-500">
          {ROLE_PROTECTION_ENABLED
            ? "Sign in to access the admin or field portal."
            : "Choose a portal to continue. Authentication is temporarily disabled."}
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap">
          {ROLE_PROTECTION_ENABLED ? (
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
            >
              Sign in
            </Link>
          ) : null}

          <Link
            href="/admin"
            className="rounded-lg bg-gray-800 px-8 py-4 text-lg font-semibold text-white transition hover:bg-black"
          >
            Admin Portal
          </Link>
          <Link
            href="/mobile"
            className="rounded-lg border border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-800 transition hover:bg-gray-50"
          >
            Field Portal
          </Link>
        </div>

        {ROLE_PROTECTION_ENABLED && session ? (
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-6 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            Sign out
          </button>
        ) : null}
      </div>
    </main>
  );
}