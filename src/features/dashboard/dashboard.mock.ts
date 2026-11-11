import type {
  ReferringClinicianDashboard,
  ReceivingClinicianDashboard,
  FacilityAdministratorDashboard,
} from "./dashboard.types";
import type { DashboardSummary } from "./dashboard.types";

export const dashboardMock: DashboardSummary = {
  stats: {
    activeCases: 148,
    urgentCases: 8,
    overdueCases: 11,
    unassignedCases: 4,
  },

  priorityCases: [
    {
      id: "CASE-001",
      patientLabel: "Patient A",
      screeningResult: "Abnormal screening result",
      nextStep: "Confirmatory testing",
      owner: "Dr. Williams",
      dueLabel: "2 days overdue",
      priority: "urgent",
      status: "Awaiting action",
    },
    {
      id: "CASE-002",
      patientLabel: "Patient B",
      screeningResult: "Positive screening result",
      nextStep: "Specialist referral",
      owner: "Nurse Johnson",
      dueLabel: "Due today",
      priority: "high",
      status: "Referral pending",
    },
    {
      id: "CASE-003",
      patientLabel: "Patient C",
      screeningResult: "Abnormal screening result",
      nextStep: "Patient notification",
      owner: null,
      dueLabel: "Unassigned",
      priority: "high",
      status: "Awaiting ownership",
    },
    {
      id: "CASE-004",
      patientLabel: "Patient D",
      screeningResult: "Positive screening result",
      nextStep: "Clinical consultation",
      owner: "Dr. Adams",
      dueLabel: "Due tomorrow",
      priority: "normal",
      status: "In progress",
    },
  ],

  careProgress: [
    { label: "Patient notification", count: 126, percentage: 85 },
    { label: "Confirmatory testing", count: 101, percentage: 68 },
    { label: "Clinical consultation", count: 80, percentage: 54 },
    { label: "Referral completion", count: 62, percentage: 42 },
    { label: "Documented closure", count: 46, percentage: 31 },
  ],

  recentActivity: [
    {
      id: "ACT-001",
      description: "Screening result acknowledged",
      actor: "Nurse Johnson",
      timestampLabel: "10 minutes ago",
    },
    {
      id: "ACT-002",
      description: "Referral accepted by receiving facility",
      actor: "Dr. Williams",
      timestampLabel: "35 minutes ago",
    },
    {
      id: "ACT-003",
      description: "Patient consultation documented",
      actor: "Dr. Adams",
      timestampLabel: "1 hour ago",
    },
    {
      id: "ACT-004",
      description: "Case assigned to care coordinator",
      actor: "System",
      timestampLabel: "2 hours ago",
    },
  ],

  referrals: {
    total: 50,
    accepted: 31,
    pending: 14,
    rejected: 5,
  },
};

export const referringClinicianDashboardMock: ReferringClinicianDashboard = {
  assignedCases: 12,
  casesAwaitingReview: 4,
  referralsPending: 3,
  recentCases: [
    {
      id: "CASE-001",
      patientLabel: "Patient A",
      screeningType: "Diabetes",
      screeningResult: "Abnormal screening result",
      priority: "urgent",
      status: "Awaiting clinical review",
      nextAction: "Review screening result",
      dueLabel: "2 days overdue",
    },
    {
      id: "CASE-004",
      patientLabel: "Patient D",
      screeningType: "Cardiovascular",
      screeningResult: "Positive screening result",
      priority: "normal",
      status: "In progress",
      nextAction: "Review consultation outcome",
      dueLabel: "Due tomorrow",
    },
  ],
};

export const receivingClinicianDashboardMock: ReceivingClinicianDashboard = {
  pendingReferrals: 1,
  acceptedReferrals: 1,
  urgentReferrals: 1,
  referrals: [
    {
      id: "REF-003",
      patientLabel: "Patient G",
      screeningType: "Diabetes",
      priority: "urgent",
      referringFacility: "Northside Health Centre",
      referralReason: "Specialist assessment required",
      receivedAt: "10 Nov 2026, 10:30 AM",
      status: "pending",
    },
    {
      id: "REF-001",
      patientLabel: "Patient B",
      screeningType: "Hypertension",
      priority: "high",
      referringFacility: "Demo Facility",
      referralReason: "Further specialist assessment",
      receivedAt: "9 Nov 2026, 9:15 AM",
      status: "rejected",
    },
    {
      id: "REF-002",
      patientLabel: "Patient D",
      screeningType: "Cardiovascular",
      priority: "normal",
      referringFacility: "Demo Facility",
      referralReason: "Further clinical review",
      receivedAt: "7 Nov 2026, 11:15 AM",
      status: "accepted",
    },
  ],
};

export const facilityAdministratorDashboardMock: FacilityAdministratorDashboard =
  {
    staff: {
      totalStaff: 24,
      activeStaff: 20,
      inactiveStaff: 2,
      pendingAccess: 2,
    },
    facilityConnections: [
      {
        id: "FAC-001",
        facilityName: "Demo Facility",
        connectionStatus: "connected",
        lastChecked: "10 Nov 2026, 9:00 AM",
      },
      {
        id: "FAC-002",
        facilityName: "Central Specialist Hospital",
        connectionStatus: "connected",
        lastChecked: "10 Nov 2026, 9:05 AM",
      },
    ],
  };

export const centralSpecialistDashboardMock: DashboardSummary = {
  stats: {
    activeCases: 100,
    urgentCases: 4,
    overdueCases: 7,
    unassignedCases: 3,
  },

  priorityCases: [
    {
      id: "CASE-009",
      patientLabel: "Patient H",
      screeningResult: "Positive screening result",
      nextStep: "Specialist consultation",
      owner: "Dr. Okafor",
      dueLabel: "Due today",
      priority: "urgent",
      status: "Awaiting clinical review",
    },
    {
      id: "CASE-010",
      patientLabel: "Patient I",
      screeningResult: "Abnormal screening result",
      nextStep: "Confirmatory testing",
      owner: "Nurse Williams",
      dueLabel: "1 day overdue",
      priority: "high",
      status: "Awaiting action",
    },
    {
      id: "CASE-011",
      patientLabel: "Patient J",
      screeningResult: "Positive screening result",
      nextStep: "Patient follow-up",
      owner: null,
      dueLabel: "Unassigned",
      priority: "high",
      status: "Awaiting ownership",
    },
  ],

  careProgress: [
    { label: "Patient notification", count: 84, percentage: 84 },
    { label: "Confirmatory testing", count: 67, percentage: 67 },
    { label: "Clinical consultation", count: 54, percentage: 54 },
    { label: "Referral completion", count: 42, percentage: 42 },
    { label: "Documented closure", count: 31, percentage: 31 },
  ],

  recentActivity: [
    {
      id: "CSA-001",
      description: "Incoming referral received",
      actor: "Dr. Williams",
      timestampLabel: "15 minutes ago",
    },
    {
      id: "CSA-002",
      description: "Consultation request accepted",
      actor: "Dr. Okafor",
      timestampLabel: "40 minutes ago",
    },
    {
      id: "CSA-003",
      description: "Patient follow-up recorded",
      actor: "Nurse Williams",
      timestampLabel: "1 hour ago",
    },
    {
      id: "CSA-004",
      description: "Case assigned to coordinator",
      actor: "Mary Johnson",
      timestampLabel: "2 hours ago",
    },
  ],

  referrals: {
    total: 36,
    accepted: 21,
    pending: 10,
    rejected: 5,
  },
};
