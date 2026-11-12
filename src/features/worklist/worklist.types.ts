export type CasePriority = "urgent" | "high" | "normal";


export interface WorklistCase {
  id: string;
  patientLabel: string;
  age: number;
  sex: string;
  screeningType: string;
  screeningResult: string;
  priority: CasePriority;
  status: string;
  specialty: string | null;
  assignedTo: string | null;
  assignedClinicianSpecialty: string | null;
  routingStatus: "not_required" | "awaiting_acceptance" | "accepted" | "exception";
  facility: string;
  nextAction: string;
  dueDate: string | null;
  lastUpdated: string;
    flags?: CaseFlag[];
  closure?: CaseClosureRecord;
  closedAt?: string;
}


export interface CaseTimelineEvent {
  id: string;
  caseId: string;
  eventType: string;
  title: string;
  description: string;
  actor: string;
  actorRole: string;
  timestamp: string;
}

export interface WorklistSummary {
  totalCases: number;
  urgentCases: number;
  overdueCases: number;
  unassignedCases: number;
}

export interface WorklistFilters {
  search: string;
  priority: CasePriority | "all";
  status: string;
  facility: string;
  assignedTo: string;
}

export interface WorklistResponse {
  summary: WorklistSummary;
  cases: WorklistCase[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type CaseFlag = "DATA_MISSING";

export type ClosureType =
  | "care_confirmed"
  | "not_actionable"
  | "no_further_care_needed"
  | "patient_declined"
  | "unreachable"
  | "moved_or_transferred"
  | "other";

export type ClosureEvidenceKind =
  | "treatment_start"
  | "specialist_outcome"
  | "clinical_decision"
  | "confirmatory_result"
  | "informed_refusal"
  | "contact_attempts"
  | "transfer_acceptance"
  | "documented_handoff";

export interface ClosureEvidenceItem {
  id: string;
  kind: ClosureEvidenceKind;
  label: string;
  present: boolean;
  sourceRecordId?: string;
  sourceDescription?: string;
}

export interface CaseEvidenceRecord {
  id: string;
  caseId: string;
  kind: ClosureEvidenceKind;
  title: string;
  description: string;
  recordedBy: string;
  recordedByRole: string;
  recordedAt: string;
  sourceReference?: string;
}

export interface CaseClosureRecord {
  id: string;
  caseId: string;
  closureType: ClosureType;
  reason: string;
  evidence: ClosureEvidenceItem[];
  closedBy: string;
  closedByStaffId: string;
  closedByRole: string;
  closedAt: string;
  secondApprover?: string;
  secondApproverStaffId?: string;
}

export interface CaseClosureRequest {
  closureType: ClosureType;
  reason: string;
  evidence: ClosureEvidenceItem[];
  secondApproverStaffId?: string;
}