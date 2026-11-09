export interface Patient {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: "Male" | "Female";
  phone: string;
  facility: string;
  activeCases: number;
  latestScreening: string;
  lastUpdated: string;
}

export interface PatientFilters {
  search: string;
  facility: string;
  sex: "all" | "Male" | "Female";
}