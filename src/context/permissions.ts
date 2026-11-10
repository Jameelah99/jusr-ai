
import type { UserRole } from "./UserContext";

// Application sections
export type AppPermission =
  | "dashboard"
  | "worklist"
  | "patients"
  | "referrals"
  | "consultations"
  | "measures"
  | "facilities"
  | "settings";

// Navigation and page access by staff role
export const rolePermissions: Record<UserRole, AppPermission[]> = {
  coordinator: [
    "dashboard",
    "worklist",
    "patients",
    "referrals",
    "measures",
  ],

  referring_clinician: [
    "dashboard",
    "worklist",
    "referrals",
    "consultations",
  ],

  receiving_clinician: [
    "dashboard",
    "referrals",
    "consultations",
  ],

  facility_administrator: [
    "dashboard",
    "facilities",
    "settings",
  ],
};

// Check whether a role has access to an application section
export function hasPermission(
  role: UserRole,
  permission: AppPermission
): boolean {
  return rolePermissions[role].includes(permission);
}
