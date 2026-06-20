"use client";

import { useAuth } from "@/components/AuthProvider";
import LoadingSpinner from "@/components/mobile/LoadingSpinner";
import {
  canAccessAdminPortal,
  canAccessMobilePortal,
  type PortalRole,
} from "@/lib/role";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

type RoleGuardProps = {
  children: ReactNode;
  requiredRole: PortalRole;
};

export default function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const router = useRouter();
  const { session, profile, user, isLoading } = useAuth();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!session) {
      router.replace("/login");
      return;
    }

    if (requiredRole === "admin") {
      if (!canAccessAdminPortal(profile, user)) {
        router.replace(canAccessMobilePortal(profile) ? "/mobile" : "/login");
        return;
      }
    }

    if (requiredRole === "process_server") {
      if (!canAccessMobilePortal(profile)) {
        router.replace(canAccessAdminPortal(profile, user) ? "/admin" : "/login");
        return;
      }
    }

    setAllowed(true);
  }, [isLoading, session, profile, user, requiredRole, router]);

  if (isLoading || !allowed) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50 py-20">
        <LoadingSpinner className="h-8 w-8 text-blue-600" label="Checking access" />
      </div>
    );
  }

  return children;
}