
import { patientsMock } from "./patients.mock";
import type { Patient } from "./patients.types";

export async function getPatients(
  facilityName: string,
): Promise<Patient[]> {
  // Simulate an API request for the frontend demonstration.
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Return only patients belonging to the active user's facility.
  return patientsMock.filter(
    (patient) => patient.facility === facilityName,
  );
}
