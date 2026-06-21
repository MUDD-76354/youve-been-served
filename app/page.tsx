// TODO: Re-implement proper User/Admin role separation with working login

import Image from "next/image";
import Link from "next/link";

export default function Home() {
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
          Both portals are open. Role checks are temporarily disabled.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/admin"
            className="rounded-lg bg-gray-800 px-8 py-4 text-lg font-semibold text-white transition hover:bg-black"
          >
            Admin Portal
          </Link>
          <Link
            href="/mobile"
            className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
          >
            Field Portal
          </Link>
        </div>
      </div>
    </main>
  );
}