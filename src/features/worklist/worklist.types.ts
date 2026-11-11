
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
