
import { apiRequest } from "../../services/api/apiClient";
import type { Patient } from "./patients.types";

interface PatientApiRecord {
  id: string;
  displayLabel: string;
  ageYears: number | null;
  sex: "M" | "F" | "Male" | "Female" | null;
  isSynthetic: boolean;
  facility: string;
  activeCases: number;
  latestScreening: string;
  lastUpdated: string | null;
}

export async function getPatients(): Promise<Patient[]> {
  const records = await apiRequest<PatientApiRecord[]>("/api/patients");

  return records.map((item) => ({
    id: item.id,
    displayLabel: item.displayLabel,
    ageYears: item.ageYears,
    sex:
      item.sex === "Male"
        ? "M"
        : item.sex === "Female"
          ? "F"
          : item.sex ?? "",
    isSynthetic: item.isSynthetic,
    facility: item.facility || "Not recorded",
    activeCases: item.activeCases ?? 0,
    latestScreening: item.latestScreening || "Not available",
    lastUpdated: item.lastUpdated,
  }));
}
