
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
