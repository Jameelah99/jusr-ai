import { apiRequest } from "../../services/api/apiClient";
import type { PatientProfileData } from "./patient-profile.types";

export async function getPatientProfile(
  patientId: string
): Promise<PatientProfileData | null> {
  const data = await apiRequest<PatientProfileData>(
    `/api/patients/${patientId}`
  );

  return data;
}
