// TODO: Re-implement proper User/Admin role separation with working login

import { type ReactNode } from "react";

type RoleGuardProps = {
  children: ReactNode;
  requiredRole?: "admin" | "process_server";
};

/**
 * Role enforcement is temporarily disabled. This component is a pass-through
 * so Admin and Mobile portals remain fully accessible.
 */
export default function RoleGuard({ children }: RoleGuardProps) {
  return children;

  /*
  // Restore when ROLE_PROTECTION_ENABLED is true:
  const router = useRouter();
  const { session, profile, user, isLoading } = useAuth();
  ...
  */
}