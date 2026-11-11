export type ReferralPriority = "urgent" | "high" | "normal";

export type ReferralStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "escalated"
  | "outcome_recorded";

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
