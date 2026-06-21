// TODO: Re-implement proper User/Admin role separation with working login

import Link from "next/link";

export default function Nav() {
  return (
    <nav className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-6 px-6 py-4">
        <Link
          href="/"
          className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
        >
          Home
        </Link>
        <Link
          href="/admin"
          className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
        >
          Admin
        </Link>
        <Link
          href="/mobile"
          className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
        >
          Mobile
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-gray-600 transition hover:text-blue-600"
        >
          Sign in
        </Link>
      </div>
    </nav>
  );
}