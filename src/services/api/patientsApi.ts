import { apiEnvelope, apiRequest } from "./apiClient";
import type { PagedResult } from "./v6.types";

export interface PatientListItem {
  id: string;
  displayLabel: string;
  ageYears: number | null;
  sex: string | null;
  isSynthetic: boolean;
  facility: string;
  activeCases: number;
  latestScreening: string;
  lastUpdated: string | null;
}

export interface PatientProfile {
  patient: {
    id: string;
    displayLabel: string;
    ageYears: number | null;
    sex: string | null;
    isSynthetic: boolean;
  };
  cases: {
    id: string;
    caseNumber: string;
    screeningType: string;
    screeningResult: string;
    priority: string;
    status: string;
    assignedTo: string | null;
    facility: string;
    createdAt: string;
    lastUpdated: string | null;
    nextAction: string | null;
  }[];
  screenings: {
    id: string;
    screeningType: string;
    result: string;
    date: string;
    facility: string;
  }[];
  communications: {
    id: string;
    channel: string;
    description: string;
    status: string;
    date: string;
  }[];
  patientLink: { status: string; expiresAt: string | null };
  patientLinks: {
    id: string;
    caseId: string;
    status: string;
    createdAt: string;
    expiresAt: string;
  }[];
}

export async function listPatients(
  params: { skip?: number; limit?: number } = {}
): Promise<PagedResult<PatientListItem>> {
  const search = new URLSearchParams();
  if (params.skip !== undefined) search.set("skip", String(params.skip));
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  const query = search.toString();
  const response = await apiEnvelope<PatientListItem[]>(
    `/api/patients${query ? `?${query}` : ""}`
  );
  return {
    items: response.data,
    total: response.data.length,
    page: Math.floor((params.skip ?? 0) / (params.limit ?? 50)) + 1,
    pageSize: params.limit ?? 50,
  };
}

export function createPatient(payload: {
  displayLabel: string;
  ageYears?: number | null;
  birthYear?: number | null;
  sex?: string | null;
}) {
  return apiRequest<{ id: string; displayLabel: string; isSynthetic: boolean }>(
    "/api/patients",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export function getPatientProfile(patientId: string) {
  return apiRequest<PatientProfile>(
    `/api/patients/${encodeURIComponent(patientId)}/profile`
  );
}
