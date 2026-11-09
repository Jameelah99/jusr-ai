import { patientsMock } from "./patients.mock";
import type { Patient } from "./patients.types";

export async function getPatients(): Promise<Patient[]> {
  // Simulate an API request for the frontend demonstration.
  await new Promise((resolve) => setTimeout(resolve, 400));

  return patientsMock;
}