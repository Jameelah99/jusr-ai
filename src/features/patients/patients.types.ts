export interface Patient {
  id: string;
  displayLabel: string;
  ageYears: number | null;
  sex: "M" | "F" | string;
  isSynthetic: boolean;
  facility: string;
  activeCases: number;
  latestScreening: string;
  lastUpdated: string | null;
}

export interface PatientFilters {
  search: string;
  facility: string;
  sex: "all" | "M" | "F";
}