"use client";

import { useAuth } from "@/components/AuthProvider";
import { getPortalPathForAuth } from "@/lib/role";
import Link from "next/link";

export default function Nav() {
  const { session, profile, user, isLoading, signOut } = useAuth();
  const portalPath = getPortalPathForAuth(profile, user);

  return (
    <nav className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-6 px-6 py-4">
        <Link
          href="/"
          className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
        >
          Home
        </Link>

        {!isLoading && session && portalPath ? (
          <Link
            href={portalPath}
            className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
          >
            Portal
          </Link>
        ) : null}

        {!isLoading && session ? (
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
          >
            Sign out
          </button>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}