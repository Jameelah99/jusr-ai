
import { apiRequest } from "./apiClient";
import type {
  WorklistResponse,
  WorklistFilters,
  CaseTimelineEvent,
} from "../../features/worklist/worklist.types";


interface ApiWorklistCase {
  id: string;
  caseId: string;
  patient?: {
    id?: string;
    displayLabel?: string;
    ageYears?: number;
    sex?: string;
  } | null;
  screening?: {
    type?: string;
    outcome?: string;
    displayLabel?: string;
  } | null;
  priority?: string | null;
  status?: string | null;
  flags?: string[];
  assignedCoordinator?: {
    id?: string;
    displayName?: string;
  } | null;
  owner?: {
    id?: string;
    displayName?: string;
  } | null;
  facility?: {
    id?: string;
    name?: string;
  } | null;
  nextAction?: {
    label?: string;
  } | null;
  dueAt?: string | null;
  updatedAt?: string | null;
  specialty?: string | null;
  routingStatus?: string | null;
  routing?: {
    status?: string;
    specialty?: string;
  } | null;
  patientLabel?: string;
  age?: number;
  sex?: string;
  screeningType?: string;
  assignedTo?: string | null;
}

interface ApiWorklistResponse {
  summary: WorklistResponse["summary"];
  cases: ApiWorklistCase[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getWorklist(
  _facilityId?: string,
  filters?: Partial<WorklistFilters>,
): Promise<WorklistResponse> {
  const params = new URLSearchParams();

  if (filters?.priority && filters.priority !== "all") {
    params.set("priority", filters.priority.toUpperCase());
  }

  if (filters?.status && filters.status !== "all") {
    params.set("status", filters.status.toUpperCase());
  }

  const query = params.toString();
  const path = query
    ? `/api/v1/worklist?${query}`
    : "/api/v1/worklist";

  const data = await apiRequest<ApiWorklistResponse>(path);

  return {
    ...data,
    cases: (data?.cases ?? []).map((item) => {
      const priority = String(item.priority ?? "NORMAL").toLowerCase();

      const routingStatus = item.routingStatus
        ? item.routingStatus.toLowerCase()
        : priority === "urgent"
          ? "exception"
          : "not_required";

      return {
        id: item.id,
        patientId: item.patient?.id,
        facilityId: item.facility?.id,
        ownerStaffId: item.owner?.id ?? null,
        patientLabel:
          item.patientLabel ?? item.patient?.displayLabel ?? "Unknown patient",
        age: item.age ?? item.patient?.ageYears ?? 0,
        sex: item.sex ?? item.patient?.sex ?? "Unknown",
        screeningType:
          item.screeningType ?? item.screening?.type ?? "Not specified",
        screeningResult:
          item.screening?.displayLabel ??
          item.screening?.outcome ??
          "Not available",
        priority: priority as WorklistResponse["cases"][number]["priority"],
        status: item.status ?? "UNKNOWN",
        specialty: item.specialty ?? null,
        assignedTo:
          item.assignedTo ?? item.assignedCoordinator?.displayName ?? null,
        assignedClinicianSpecialty: item.routing?.specialty ?? null,
        routingStatus:
          routingStatus as WorklistResponse["cases"][number]["routingStatus"],
        facility: item.facility?.name ?? "Unknown facility",
        nextAction: item.nextAction?.label ?? "Review case",
        dueDate: item.dueAt ? item.dueAt.slice(0, 10) : null,
        lastUpdated: item.updatedAt ?? "",
        flags: (item.flags ?? []).filter(
          (flag): flag is "DATA_MISSING" | "OVERDUE" =>
            flag === "DATA_MISSING" || flag === "OVERDUE",
        ),
      };
    }),
  };
}


interface ApiCaseEvent {
  id: string;
  eventType: string;
  description: string;
  occurredAt: string;
  actorId: string | null;
  actorRole: string;
}

export async function getCaseTimeline(
  caseId: string,
): Promise<CaseTimelineEvent[]> {
  const events = await apiRequest<ApiCaseEvent[]>(
    `/api/cases/${encodeURIComponent(caseId)}/events`,
  );

  return events.map((event) => ({
    id: event.id,
    caseId,
    eventType: event.eventType,
    title: event.eventType
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase()),
    description: event.description,
    actor: event.actorId || "System",
    actorRole: event.actorRole || "System",
    timestamp: event.occurredAt,
  }));
}

// Assign a case to an active coordinator.
export async function assignCase(
  caseId: string,
  coordinatorId: string,
) {
  return apiRequest<{
    caseId: string;
    coordinatorId: string;
    status: string;
  }>(`/api/cases/${encodeURIComponent(caseId)}/assign`, {
    method: "POST",
    body: JSON.stringify({ coordinatorId }),
  });
}

// Change the status of a case.
export type CaseStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "REFERRED"
  | "RESOLVED"
  | "CLOSED";

export interface CaseTransitionPayload {
  status: CaseStatus;
  evidence?: string;
  decision?: string;
  closureType?: ClosureType;
  reason?: string;
  closureEvidence?: ClosureEvidenceItem[];
  secondApproverStaffId?: string;
}

export type ClosureType =
  | "care_confirmed"
  | "not_actionable"
  | "no_further_care_needed"
  | "patient_declined"
  | "unreachable"
  | "moved_or_transferred"
  | "other";

export interface ClosureEvidenceItem {
  id: string;
  kind: string;
  label: string;
  present: boolean;
  sourceRecordId?: string | null;
  sourceDescription?: string | null;
}

export async function transitionCase(
  caseId: string,
  payload: CaseTransitionPayload,
) {
  return apiRequest<{
    caseId: string;
    status: string;
  }>(`/api/cases/${encodeURIComponent(caseId)}/transition`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Route an urgent case to a qualified receiving clinician.
// If clinicianId is omitted, the backend selects a qualified clinician.
export interface UrgentRoutingPayload {
  clinicianId?: string;
  specialty?: string;
}

export async function routeUrgentCase(
  caseId: string,
  payload: UrgentRoutingPayload = {},
) {
  return apiRequest<Record<string, unknown>>(
    `/api/cases/${encodeURIComponent(caseId)}/urgent-routing`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

// Accept an urgent case as the assigned receiving clinician.
export async function acceptUrgentCase(caseId: string) {
  return apiRequest<Record<string, unknown>>(
    `/api/urgent-cases/${encodeURIComponent(caseId)}/accept`,
    {
      method: "POST",
    },
  );
}
