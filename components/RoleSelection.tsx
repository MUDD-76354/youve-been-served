"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  getPortalPathForRole,
  ROLE_LABELS,
  storeRole,
  type UserRole,
} from "@/lib/role";

const roleOptions: {
  role: UserRole;
  buttonClassName: string;
}[] = [
  {
    role: "process_server",
    buttonClassName:
      "rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700",
  },
  {
    role: "admin",
    buttonClassName:
      "rounded-lg bg-gray-800 px-8 py-4 text-lg font-semibold text-white transition hover:bg-black",
  },
];

export default function RoleSelection() {
  const router = useRouter();

  function handleSelect(role: UserRole) {
    storeRole(role);
    router.push(getPortalPathForRole(role));
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
          Select your role to continue.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          {roleOptions.map(({ role, buttonClassName }) => (
            <button
              key={role}
              type="button"
              onClick={() => handleSelect(role)}
              className={buttonClassName}
            >
              {ROLE_LABELS[role]}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}