
import type { DashboardSummary } from "./dashboard.types";

export const dashboardMock: DashboardSummary = {
  stats: {
    activeCases: 248,
    urgentCases: 12,
    overdueCases: 18,
    unassignedCases: 7,
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
    {
      label: "Patient notification",
      count: 210,
      percentage: 85,
    },
    {
      label: "Confirmatory testing",
      count: 168,
      percentage: 68,
    },
    {
      label: "Clinical consultation",
      count: 134,
      percentage: 54,
    },
    {
      label: "Referral completion",
      count: 104,
      percentage: 42,
    },
    {
      label: "Documented closure",
      count: 77,
      percentage: 31,
    },
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
    total: 86,
    accepted: 52,
    pending: 24,
    rejected: 10,
  },
};
