
import type { WorklistCase } from "./worklist.types";
import { specialtyRoutingConfig } from "./routing.config";

export function getSpecialtyRoutingPool(specialty: string) {
  return specialtyRoutingConfig.find(
    (pool) => pool.specialty === specialty
  ) ?? null;
}

export function getEligiblePrimaryClinicians(
  caseRecord: WorklistCase
): string[] {
  if (caseRecord.priority !== "urgent" || !caseRecord.specialty) {
    return [];
  }

  const pool = getSpecialtyRoutingPool(caseRecord.specialty);

  return pool?.primaryClinicians ?? [];
}

export function getBackupClinician(
  specialty: string
): string | null {
  const pool = getSpecialtyRoutingPool(specialty);

  return pool?.backupClinician ?? null;
}
