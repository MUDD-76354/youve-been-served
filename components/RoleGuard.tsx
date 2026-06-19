"use client";

import LoadingSpinner from "@/components/mobile/LoadingSpinner";
import { getStoredRole, type UserRole } from "@/lib/role";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

type RoleGuardProps = {
  children: ReactNode;
  requiredRole: UserRole;
};

export default function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const role = getStoredRole();

    if (!role || role !== requiredRole) {
      router.replace("/");
      return;
    }

    setAllowed(true);
  }, [router, requiredRole]);

  if (!allowed) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50 py-20">
        <LoadingSpinner className="h-8 w-8 text-blue-600" label="Checking access" />
      </div>
    );
  }

  return children;
}