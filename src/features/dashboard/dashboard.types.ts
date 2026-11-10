
export interface DashboardStats {
  activeCases: number;
  urgentCases: number;
  overdueCases: number;
  unassignedCases: number;
}

export interface PriorityCase {
  id: string;
  patientLabel: string;
  screeningResult: string;
  nextStep: string;
  owner: string | null;
  dueLabel: string;
  priority: "urgent" | "high" | "normal";
  status: string;
}

export interface CareStage {
  label: string;
  count: number;
  percentage: number;
}

export interface RecentActivityItem {
  id: string;
  description: string;
  actor: string;
  timestampLabel: string;
}

export interface ReferralOverview {
  total: number;
  accepted: number;
  pending: number;
  rejected: number;
}

export interface DashboardSummary {
  stats: DashboardStats;
  priorityCases: PriorityCase[];
  careProgress: CareStage[];
  recentActivity: RecentActivityItem[];
  referrals: ReferralOverview;
}

// Referring Clinician Dashboard

export interface ClinicianCase {
  id: string;
  patientLabel: string;
  screeningType: string;
  screeningResult: string;
  priority: "urgent" | "high" | "normal";
  status: string;
  nextAction: string;
  dueLabel: string;
}

export interface ReferringClinicianDashboard {
  assignedCases: number;
  casesAwaitingReview: number;
  referralsPending: number;
  recentCases: ClinicianCase[];
}

// Receiving Clinician Dashboard

export interface IncomingReferral {
  id: string;
  patientLabel: string;
  screeningType: string;
  priority: "urgent" | "high" | "normal";
  referringFacility: string;
  referralReason: string;
  receivedAt: string;
  status: "pending" | "accepted" | "rejected" | "escalated" | "outcome_recorded";
}

export interface ReceivingClinicianDashboard {
  pendingReferrals: number;
  acceptedReferrals: number;
  urgentReferrals: number;
  referrals: IncomingReferral[];
}

// Facility Administrator Dashboard
// R-09: No clinical case or patient information.

export interface StaffAccessSummary {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  pendingAccess: number;
}

export interface FacilityConnection {
  id: string;
  facilityName: string;
  connectionStatus: "connected" | "disconnected" | "pending";
  lastChecked: string;
}

export interface FacilityAdministratorDashboard {
  staff: StaffAccessSummary;
  facilityConnections: FacilityConnection[];
}


export type DashboardData =
  | DashboardSummary
  | ReferringClinicianDashboard
  | ReceivingClinicianDashboard
  | FacilityAdministratorDashboard;
