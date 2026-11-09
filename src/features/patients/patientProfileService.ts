import { patientProfilesMock } from "./patient-profile.mock";
import type { PatientProfileData } from "./patient-profile.types";

export async function getPatientProfile(
  patientId: string,
): Promise<PatientProfileData | null> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return (
    patientProfilesMock.find(
      (profile) => profile.patient.id === patientId,
    ) ?? null
  );
}