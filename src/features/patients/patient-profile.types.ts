import type { Patient } from "./patients.types";

export interface PatientCase {
  id: string;
  screeningType: string;
  screeningResult: string;
  priority: "urgent" | "high" | "normal";
  status: string;
  assignedTo: string | null;
  facility: string;
  createdAt: string;
  lastUpdated: string;
}

export interface PatientScreening {
  id: string;
  screeningType: string;
  result: string;
  date: string;
  facility: string;
}

export interface PatientCommunication {
  id: string;
  channel: "SMS" | "Phone" | "Patient Link";
  description: string;
  status: "Delivered" | "Pending" | "Failed" | "Recorded";
  date: string;
}

export interface PatientProfileData {
  patient: Patient;
  cases: PatientCase[];
  screenings: PatientScreening[];
  communications: PatientCommunication[];
  patientLink: {
    status: "Active" | "Expired" | "Not generated";
    expiresAt: string | null;
  };
}