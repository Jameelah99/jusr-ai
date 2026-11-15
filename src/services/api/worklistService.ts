
import { apiRequest } from "./apiClient";
import type {
  WorklistResponse,
  WorklistFilters,
  CaseTimelineEvent,
} from "../../features/worklist/worklist.types";

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
  const path = query ? `/api/worklist?${query}` : "/api/worklist";

  const data = await apiRequest<WorklistResponse>(path);

  return {
    ...data,
    cases: data.cases.map((item) => ({
      ...item,
      priority:
        item.priority.toLowerCase() as WorklistResponse["cases"][number]["priority"],
      routingStatus:
        item.routingStatus.toLowerCase() as WorklistResponse["cases"][number]["routingStatus"],
    })),
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
