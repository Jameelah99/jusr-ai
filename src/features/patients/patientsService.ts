import { apiRequest } from "../../services/api/apiClient";
import type { Patient } from "./patients.types";

interface PatientApiRecord {
  id: string;
  displayLabel: string;
  ageYears: number | null;
  sex: "Male" | "Female";
  isSynthetic: boolean;
}

export async function getPatients(): Promise<Patient[]> {
  const records = await apiRequest<PatientApiRecord[]>("/api/patients");

  return records.map((item) => {
    const nameParts = item.displayLabel.trim().split(/\s+/);

    return {
      id: item.id,
      patientNumber: item.id,
      firstName: nameParts[0] ?? "",
      lastName: nameParts.slice(1).join(" "),
      age: item.ageYears ?? 0,
      sex: item.sex,
      phone: "",
      facility: "Not provided",
      activeCases: 0,
      latestScreening: "Not available",
      lastUpdated: "",
    };
  });
}