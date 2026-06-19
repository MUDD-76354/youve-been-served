"use client";

import LoadingSpinner from "@/components/mobile/LoadingSpinner";
import RoleSelection from "@/components/RoleSelection";
import { getPortalPathForRole, getStoredRole } from "@/lib/role";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const showRoleSwitch = searchParams.get("switch") === "1";

  useEffect(() => {
    const role = getStoredRole();

    if (role && !showRoleSwitch) {
      router.replace(getPortalPathForRole(role));
      return;
    }

    setReady(true);
  }, [router, showRoleSwitch]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50 py-20">
        <LoadingSpinner className="h-8 w-8 text-blue-600" label="Loading" />
      </div>
    );
  }

  return <RoleSelection allowSwitch={showRoleSwitch} />;
}