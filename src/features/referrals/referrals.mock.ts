
import type {
  Referral,
  ReferralTimelineEvent,
  ReferralSummary,
  ReferralResponse,
} from "./referrals.types";

export const referralsMock: Referral[] = [
  {
    id: "REF-001",
    caseId: "CASE-002",
    patientLabel: "Patient B",
    screeningType: "Hypertension screening",
    priority: "high",
    referringFacility: "Demo Facility",
    receivingFacility: "Central Specialist Hospital",
    referringClinician: "Dr Williams",
    receivingClinician: "Dr Okafor",
    referralReason:
      "Positive hypertension screening result requiring specialist assessment.",
    clinicalSummary:
      "Patient recorded a positive hypertension screening result. Specialist review is requested for further assessment and care planning.",
    status: "pending",
    createdAt: "2026-11-07T11:00:00",
    responseDueAt: "2026-11-10T17:00:00",
    lastUpdated: "2026-11-07T11:00:00",
    rejectionReason: null,
    escalationReason: null,
    outcome: null,
  },
  {
    id: "REF-002",
    caseId: "CASE-004",
    patientLabel: "Patient D",
    screeningType: "Cardiovascular screening",
    priority: "normal",
    referringFacility: "Demo Facility",
    receivingFacility: "Central Specialist Hospital",
    referringClinician: "Dr. Adams",
    receivingClinician: "Dr. Okafor",
    referralReason:
      "Positive cardiovascular screening result requiring clinical review.",
    clinicalSummary:
      "Patient has a positive cardiovascular screening result. Referral submitted for specialist consultation and further evaluation.",
    status: "accepted",
    createdAt: "2026-11-07T11:15:00",
    responseDueAt: "2026-11-09T17:00:00",
    lastUpdated: "2026-11-08T09:30:00",
    rejectionReason: null,
    escalationReason: null,
    outcome: null,
  },
  {
    id: "REF-003",
    caseId: "CASE-008",
    patientLabel: "Patient G",
    screeningType: "Diabetes screening",
    priority: "urgent",
    referringFacility: "Northside Health Centre",
    receivingFacility: "Central Specialist Hospital",
    referringClinician: "Nurse Williams",
    receivingClinician: null,
    referralReason:
      "Abnormal diabetes screening result requiring prompt specialist assessment.",
    clinicalSummary:
      "Patient recorded an abnormal diabetes screening result. Specialist assessment is requested for further evaluation and care planning.",
    status: "pending",
    createdAt: "2026-11-09T10:30:00",
    responseDueAt: "2026-11-10T17:00:00",
    lastUpdated: "2026-11-09T10:30:00",
    rejectionReason: null,
    escalationReason: null,
    outcome: null,
  },
];

export const referralTimelineMock: ReferralTimelineEvent[] = [
  {
    id: "REVT-001",
    referralId: "REF-001",
    eventType: "referral_created",
    title: "Referral submitted",
    description:
      "Referral submitted to Central Specialist Hospital for specialist assessment.",
    actor: "Dr Williams",
    actorRole: "Referring clinician",
    timestamp: "2026-11-07T11:00:00",
  },
  {
    id: "REVT-002",
    referralId: "REF-002",
    eventType: "referral_created",
    title: "Referral submitted",
    description:
      "Cardiovascular referral submitted to Central Specialist Hospital.",
    actor: "Dr. Adams",
    actorRole: "Referring clinician",
    timestamp: "2026-11-07T11:15:00",
  },
  {
    id: "REVT-003",
    referralId: "REF-002",
    eventType: "referral_accepted",
    title: "Referral accepted",
    description:
      "Receiving clinician accepted the referral for further clinical review.",
    actor: "Dr. Okafor",
    actorRole: "Receiving clinician",
    timestamp: "2026-11-08T09:30:00",
  },
  {
    id: "REVT-004",
    referralId: "REF-003",
    eventType: "referral_created",
    title: "Referral submitted",
    description:
      "Diabetes referral submitted from Northside Health Centre to Central Specialist Hospital.",
    actor: "Nurse Williams",
    actorRole: "Referring clinician",
    timestamp: "2026-11-09T10:30:00",
  },
];

const REFERRAL_STORAGE_KEY = "jusr-demo-referral-state";

interface StoredReferralState {
  referrals: Referral[];
  timelineEvents: ReferralTimelineEvent[];
}

export function loadReferralDemoState(): void {
  if (typeof window === "undefined") return;

  try {
    const saved = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved) as StoredReferralState;

    if (
      Array.isArray(parsed.referrals) &&
      Array.isArray(parsed.timelineEvents)
    ) {
      referralsMock.splice(0, referralsMock.length, ...parsed.referrals);
      referralTimelineMock.splice(
        0,
        referralTimelineMock.length,
        ...parsed.timelineEvents,
      );
    }
  } catch {
    // Keep the original mock data if saved data is unavailable or invalid.
  }
}

export function saveReferralDemoState(): void {
  if (typeof window === "undefined") return;

  try {
    const state: StoredReferralState = {
      referrals: referralsMock,
      timelineEvents: referralTimelineMock,
    };

    localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persistence failure should not break the demo workflow.
  }
}

loadReferralDemoState();

export const referralSummaryMock: ReferralSummary = {
  totalReferrals: 3,
  pendingReferrals: 2,
  acceptedReferrals: 1,
  rejectedReferrals: 0,
  escalatedReferrals: 0,
};

export const referralResponseMock: ReferralResponse = {
  summary: referralSummaryMock,
  referrals: referralsMock,
  total: referralsMock.length,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};
