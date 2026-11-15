
export type ConsultationStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "OUTCOME_RECORDED"
  | "ESCALATED";

export interface Consultation {
  id: string;
  caseId: string;
  patientLabel: string;
  screeningType: string;
  priority: "urgent" | "high" | "normal";
  referringFacility: string;
  receivingFacility: string;
  referringClinician: string;
  receivingClinician: string | null;
  reason: string;
  status: ConsultationStatus;
  requestedAt: string;
  acceptedAt: string | null;
  outcomeRecordedAt: string | null;
  outcome: string | null;
  outcomeNote: string | null;
  escalationReason: string | null;
}

export interface ConsultationFilters {
  search: string;
  status: ConsultationStatus | "all";
  priority: "urgent" | "high" | "normal" | "all";
}

export interface ConsultationResponse {
  consultations: Consultation[];
  total: number;
}

export interface ConsultationActionResponse {
  success: boolean;
  consultation: Consultation;
}

export interface RecordConsultationOutcomeRequest {
  outcome: string;
  outcomeNote: string;
}
