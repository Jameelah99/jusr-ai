import { apiRequest } from "../../services/api/apiClient";

export interface GeneratedPatientLink {
  linkId: string;
  token: string;
  url: string;
  expiresAt: string;
  verificationRequired: boolean;
  resent: boolean;
  note: string;
}

export interface PatientLinkRecord {
  id: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  failedAttempts: number;
  lockedAt: string | null;
  verifiedAt: string | null;
  lastAccessedAt: string | null;
  createdById: string | null;
}

export interface PatientResponseRecord {
  id: string;
  kind: string;
  value: Record<string, unknown> | null;
  source: "PATIENT_LINK" | "STAFF_ASSISTED";
  submissionId: string | null;
  note: string | null;
  recordedAt: string;
  recordedBy: {
    id: string;
    displayName: string;
    role: string;
  } | null;
}

export interface AssistedResponsePayload {
  acknowledged: boolean;
  understood: boolean;
  confidence: number;
  explanationStatus: "EXPLAINED" | "NOT_EXPLAINED";
  callbackRequested: boolean;
  note?: string;
}

export interface PatientPortalContext {
  patient: { displayLabel: string };
  facility: { name: string };
  screening: { displayLabel: string } | null;
  nextAction: { label: string } | null;
  dueAt: string | null;
  expiresAt: string;
  responses: {
    acknowledged: boolean;
    understood: boolean | null;
    confidence: number | null;
    explanationStatus: string | null;
    callbackRequested: boolean;
  };
}

export interface PatientVerificationResult {
  verificationRequired: boolean;
  verified: boolean;
  sessionToken: string | null;
  expiresInMinutes?: number;
}

const publicRequest = <T>(path: string, options: RequestInit = {}) =>
  apiRequest<T>(path, { ...options, authenticated: false });

const patientRequest = <T>(
  token: string,
  path: string,
  sessionToken: string | null,
  options: RequestInit = {}
) => {
  const headers = new Headers(options.headers);
  if (sessionToken) headers.set("X-Patient-Session", sessionToken);
  return publicRequest<T>(`/api/p/${encodeURIComponent(token)}${path}`, {
    ...options,
    headers,
  });
};

export async function generatePatientLink(
  caseId: string
): Promise<GeneratedPatientLink> {
  return apiRequest<GeneratedPatientLink>(`/api/cases/${caseId}/links`, {
    method: "POST",
  });
}

export async function getPatientLinks(
  caseId: string
): Promise<PatientLinkRecord[]> {
  return apiRequest<PatientLinkRecord[]>(`/api/cases/${caseId}/links`);
}

export async function getPatientResponses(
  caseId: string
): Promise<PatientResponseRecord[]> {
  return apiRequest<PatientResponseRecord[]>(
    `/api/cases/${caseId}/patient-responses`
  );
}

export async function recordAssistedPatientResponse(
  caseId: string,
  payload: AssistedResponsePayload
) {
  return apiRequest<{
    submissionId: string;
    source: "STAFF_ASSISTED";
    submittedByPatient: false;
    recordedBy: { id: string; displayName: string; role: string };
    recordedAt: string;
    responses: PatientResponseRecord[];
  }>(`/api/cases/${caseId}/assisted-responses`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyPatientLink(
  token: string,
  birthYear: number
): Promise<PatientVerificationResult> {
  return publicRequest<PatientVerificationResult>(
    `/api/p/${encodeURIComponent(token)}/verify`,
    {
      method: "POST",
      body: JSON.stringify({ birthYear }),
    }
  );
}

export async function getPatientPortalContext(
  token: string,
  sessionToken: string | null
): Promise<PatientPortalContext> {
  return patientRequest<PatientPortalContext>(token, "", sessionToken);
}

export async function acknowledgePatientInformation(
  token: string,
  sessionToken: string | null
) {
  return patientRequest(token, "/ack", sessionToken, { method: "POST" });
}

export async function submitPatientUnderstanding(
  token: string,
  sessionToken: string | null,
  understood: boolean
) {
  return patientRequest(token, "/understanding", sessionToken, {
    method: "POST",
    body: JSON.stringify({ understood }),
  });
}

export async function submitPatientConfidence(
  token: string,
  sessionToken: string | null,
  rating: number
) {
  return patientRequest(token, "/confidence", sessionToken, {
    method: "POST",
    body: JSON.stringify({ rating }),
  });
}

export async function reportPatientNotExplained(
  token: string,
  sessionToken: string | null
) {
  return patientRequest(token, "/not-explained", sessionToken, {
    method: "POST",
  });
}

export async function requestPatientCallback(
  token: string,
  sessionToken: string | null,
  payload?: { preferredTime?: string; note?: string }
) {
  return patientRequest(token, "/callback", sessionToken, {
    method: "POST",
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
}
