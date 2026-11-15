export interface PatientProfilePatient {
  id: string;
  displayLabel: string;
  ageYears: number | null;
  sex: "Male" | "Female";
  isSynthetic: boolean;
}

export interface PatientCase {
  id: string;
  caseNumber: string;
  screeningType: string;
  screeningResult: string;
  priority: "urgent" | "high" | "normal";
  status: string;
  assignedTo: string | null;
  facility: string;
  createdAt: string | null;
  lastUpdated: string | null;
  nextAction: string | null;
}

export interface PatientScreening {
  id: string;
  screeningType: string;
  result: string;
  date: string | null;
  facility: string;
}

export interface PatientCommunication {
  id: string;
  channel: string;
  description: string;
  status: "Delivered" | "Pending" | "Failed" | "Expired";
  date: string;
}

export interface PatientProfileData {
  patient: PatientProfilePatient;
  cases: PatientCase[];
  screenings: PatientScreening[];
  communications: PatientCommunication[];
  patientLink: {
    status: "Active" | "Expired" | "Not generated";
    expiresAt: string | null;
  };
}