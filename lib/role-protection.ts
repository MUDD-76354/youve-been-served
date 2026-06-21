// TODO: Re-implement proper User/Admin role separation with working login
/**
 * Global switch for route/UI role enforcement.
 * Set to true when login and role separation are ready again.
 */
export const ROLE_PROTECTION_ENABLED = false;

export function isAuthProtectionEnabled(): boolean {
  return ROLE_PROTECTION_ENABLED;
}