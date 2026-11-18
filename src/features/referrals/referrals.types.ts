export type ReferralPriority = "urgent" | "high" | "normal";

export type ReferralStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "escalated"
  | "outcome_recorded"
  | "not_accepted_in_time";

export interface Referral {
  id: string;
  caseId: string;
  patientLabel: string;
  screeningType: string;
  priority: ReferralPriority;

  referringFacility: string;
  receivingFacility: string;

  referringClinician: string;
  receivingClinician: string | null;

  referralReason: string;
  clinicalSummary: string;

  status: ReferralStatus;

  createdAt: string;
  responseDueAt: string | null;
  lastUpdated: string;

  rejectionReason: string | null;
  escalationReason: string | null;
  outcome: string | null;
}

export interface ReferralApiRecord {
  id: string;
  status: string;
  case: {
    id: string;
    caseId: string;
    priority: string;
    status: string;
    patient: {
      id: string;
      displayLabel: string;
    };
    screening: {
      type: string;
      outcome: string;
      displayLabel: string;
    } | null;
  };
  referringFacility: {
    id: string;
    name: string;
  } | null;
  receivingFacility: {
    id: string;
    name: string;
  } | null;
  receivingClinician: {
    id: string;
    displayName: string;
  } | null;
  referredById: string | null;
  referredBy: {
    id: string;
    displayName: string;
    role: string;
  } | null;
  reason: string;
  rejectionReason: string | null;
  escalated: boolean;
  escalationReason: string | null;
  escalatedAt: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
  consultation: {
    id: string;
    outcome: string;
    recordedById: string;
    recordedAt: string;
  } | null;
}

export type ReferralEventType =
  | "referral_created"
  | "referral_accepted"
  | "referral_rejected"
  | "referral_escalated"
  | "referral_reassigned"
  | "outcome_recorded";

export interface ReferralTimelineEvent {
  id: string;
  referralId: string;
  eventType: ReferralEventType;
  title: string;
  description: string;
  actor: string;
  actorRole: string;
  timestamp: string;
}

export interface ReferralSummary {
  totalReferrals: number;
  pendingReferrals: number;
  acceptedReferrals: number;
  rejectedReferrals: number;
  escalatedReferrals: number;
}

export interface ReferralFilters {
  search: string;
  priority: ReferralPriority | "all";
  status: ReferralStatus | "all";
  referringFacility: string;
  receivingFacility: string;
}

export interface ReferralResponse {
  summary: ReferralSummary;
  referrals: Referral[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ReferralActionResponse {
  success: boolean;
  referral: Referral;
}

export interface RejectReferralRequest {
  reason: string;
}

export interface EscalateReferralRequest {
  reason: string;
}
