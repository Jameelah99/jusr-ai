
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
    referringClinician: "Nurse Johnson",
    receivingClinician: null,
    referralReason:
      "Positive hypertension screening result requiring specialist assessment.",
    clinicalSummary:
      "Patient recorded a positive hypertension screening result. Specialist review is requested for further assessment and care planning.",
    status: "pending",
    createdAt: "2026-11-07T11:00:00",
    responseDueAt: "2026-11-10T17:00:00",
    lastUpdated: "2026-11-07T11:00:00",
    rejectionReason: null,
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
    actor: "Nurse Johnson",
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
