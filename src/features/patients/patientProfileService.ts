
import { apiRequest } from "../../services/api/apiClient";
import type { PatientProfileData } from "./patient-profile.types";

interface PatientProfileApiResponse {
  patient: {
    id: string;
    displayLabel: string;
    ageYears: number | null;
    sex: "M" | "F" | "Male" | "Female" | null;
    isSynthetic: boolean;
  };
  cases: PatientProfileData["cases"];
  screenings: PatientProfileData["screenings"];
  communications: PatientProfileData["communications"];
  patientLink: PatientProfileData["patientLink"];
  patientLinks?: Array<{
    id: string;
    caseId: string;
    status: string;
    createdAt: string;
    expiresAt: string | null;
  }>;
}

export async function getPatientProfile(
  patientId: string
): Promise<PatientProfileData> {
  const data = await apiRequest<PatientProfileApiResponse>(
    `/api/patients/${encodeURIComponent(patientId)}/profile`
  );

  return {
    ...data,
    patient: {
      ...data.patient,
      sex:
        data.patient.sex === "F"
          ? "Female"
          : data.patient.sex === "M"
            ? "Male"
            : data.patient.sex ?? "Female",
    },
    cases: data.cases ?? [],
    screenings: data.screenings ?? [],
    communications: data.communications ?? [],
    patientLink: data.patientLink ?? {
      status: "Not generated",
      expiresAt: null,
    },
  };
}
