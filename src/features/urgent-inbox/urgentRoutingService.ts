
import { apiRequest } from "../../services/api/apiClient";

export interface UrgentCase {
  id: string;
  caseId: string;
  patientLabel: string;
  age: number | null;
  screeningType: string;
  screeningResult: string | null;
  priority: string;
  status: string;
  requiredSpecialty: string | null;
  routingStatus: "AWAITING_ACCEPTANCE" | "ACCEPTED" | "EXCEPTION";
  routedClinician: {
    id: string;
    displayName: string;
    specialty: string | null;
  } | null;
  dueAt: string | null;
  exceptionReason: string | null;
  facility: string;
}

interface UrgentCaseApiRecord {
  id: string;
  caseId?: string;
  patientLabel?: string;
  age?: number | null;
  screeningType?: string;
  screeningResult?: string | null;
  priority?: string;
  status?: string;
  patient?: {
    displayLabel?: string;
    ageYears?: number | null;
  };
  screening?: {
    type?: string;
    outcome?: string | null;
  } | null;
  routing?: {
    status?: "AWAITING_ACCEPTANCE" | "ACCEPTED" | "EXCEPTION";
    requiredSpecialty?: string | null;
    routedClinician?: {
      id: string;
      displayName: string;
      specialty: string | null;
    } | null;
    dueAt?: string | null;
    exceptionReason?: string | null;
  } | null;
  facility?: {
    name?: string;
  } | string;
}

function mapUrgentCase(record: UrgentCaseApiRecord): UrgentCase {
  const routingStatus = record.routing?.status;

  return {
    id: record.id,
    caseId: record.caseId ?? record.id,
    patientLabel:
      record.patientLabel ?? record.patient?.displayLabel ?? "Patient",
    age: record.age ?? record.patient?.ageYears ?? null,
    screeningType:
      record.screeningType ?? record.screening?.type ?? "Not recorded",
    screeningResult:
      record.screeningResult ?? record.screening?.outcome ?? null,
    priority: record.priority ?? "URGENT",
    status: record.status ?? "OPEN",
    requiredSpecialty: record.routing?.requiredSpecialty ?? null,
    routingStatus: routingStatus ?? "AWAITING_ACCEPTANCE",
    routedClinician: record.routing?.routedClinician ?? null,
    dueAt: record.routing?.dueAt ?? null,
    exceptionReason: record.routing?.exceptionReason ?? null,
    facility:
      typeof record.facility === "string"
        ? record.facility
        : record.facility?.name ?? "Not recorded",
  };
}

export async function getUrgentCases(): Promise<UrgentCase[]> {
  const records = await apiRequest<UrgentCaseApiRecord[]>("/api/urgent-cases");

  return records.map(mapUrgentCase);
}

export async function acceptUrgentCase(caseId: string): Promise<UrgentCase> {
  const record = await apiRequest<UrgentCaseApiRecord>(
    `/api/urgent-cases/${caseId}/accept`,
    {
      method: "POST",
    }
  );

  return mapUrgentCase(record);
}
