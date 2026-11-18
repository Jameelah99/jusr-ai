
import { apiRequest } from "./apiClient";

export interface DashboardApiData {
  role: string;
  generatedAt?: string;

  stats?: {
    activeCases?: number;
    urgentCases?: number;
    overdueCases?: number;
    unassignedCases?: number;
    missingDelayReason?: number;
    awaitingUrgentAcceptance?: number;
    urgentRoutingExceptions?: number;
    assignedCases?: number;
  };

  referrals?: {
    total?: number;
    pending?: number;
    accepted?: number;
    rejected?: number;
    incoming?: number;
    urgent?: number;
    assignedToMe?: number;
    outstandingDecisions?: number;
  };

  urgentRouting?: {
    awaitingAcceptance?: number;
    accepted?: number;
  };

  facility?: {
    id: string;
    name: string;
    code?: string;
  };

  staffAccess?: {
    totalStaff: number;
    activeStaff: number;
    inactiveStaff: number;
    byRole?: Record<string, number>;
  };

  connection?: {
    status: string;
  };

    priorityCases?: Array<{
    id: string;
    caseId: string;
    patientLabel: string;
    age: number | null;
    screeningType: string | null;
    screeningResult: string | null;
    priority: "URGENT" | "HIGH" | "NORMAL";
    status: string;
    nextStep: string | null;
    nextActionCode: string | null;
    owner: string;
    dueAt: string | null;
    overdue: boolean;
  }>;

  recentActivity?: Array<{
    id: string;
    description: string;
    actor: string;
    actorRole: string | null;
    eventType: string;
    timestamp: string;
  }>;

  careProgress?: Array<{
  label: string;
  count: number;
  percentage: number;
  }>;
}

export async function getDashboardSummary(): Promise<DashboardApiData> {
  return apiRequest<DashboardApiData>("/api/dashboard/summary");
}
