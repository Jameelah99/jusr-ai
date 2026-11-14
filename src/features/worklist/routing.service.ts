
import type { WorklistCase } from "./worklist.types";
import { specialtyRoutingConfig } from "./routing.config";

export function getSpecialtyRoutingPool(specialty: string) {
  return specialtyRoutingConfig.find(
    (pool) => pool.specialty === specialty
  ) ?? null;
}

export function getEligiblePrimaryClinicians(
  caseRecord: WorklistCase,
  staff: {
    name: string;
    role: string;
    specialty?: string;
  }[],
): string[] {
  if (caseRecord.priority !== "urgent" || !caseRecord.specialty) {
    return [];
  }

  const pool = getSpecialtyRoutingPool(caseRecord.specialty);

  if (!pool) return [];

  return pool.primaryClinicians.filter((clinicianName) =>
    staff.some(
      (user) =>
        user.name === clinicianName &&
        user.role === "receiving_clinician" &&
        user.specialty === caseRecord.specialty,
    ),
  );
}

export function getBackupClinician(
  specialty: string
): string | null {
  const pool = getSpecialtyRoutingPool(specialty);

  return pool?.backupClinician ?? null;
}
