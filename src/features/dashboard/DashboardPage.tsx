
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  Clock,
  Users,
  CheckCircle,
  Building2,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StatCard from "./components/StatCard";
import PriorityQueue from "./components/PriorityQueue";
import CareProgress from "./components/CareProgress";
import ReferralOverview from "./components/ReferralOverview";
import RecentActivity from "./components/RecentActivity";
import ReferralDetails from "../referrals/components/ReferralDetails";

import type { Referral } from "../referrals/referrals.types";
import { getReferrals } from "../referrals/referralsService";
import { useUser } from "../../context/UserContext";
import { getDashboardSummary, type DashboardApiData } from "../../services/api/dashboardService";

import type {
  DashboardSummary,
  ReferringClinicianDashboard,
  ReceivingClinicianDashboard,
  FacilityAdministratorDashboard,
  PriorityCase,
  RecentActivityItem,
  IncomingReferral,
} from "./dashboard.types";

import "./dashboard.css";

function formatDueDate(value?: string | null): string {
  if (!value) return "No due date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No due date";

  if (date.getTime() < Date.now()) return "Overdue";

  return `Due ${date.toLocaleDateString()}`;
}

function mapPriorityCases(data: DashboardApiData): PriorityCase[] {
  return (data.priorityCases ?? []).map((item) => ({
    id: item.id,
    patientLabel: item.patientLabel,
    screeningResult: item.screeningResult ?? "Not recorded",
    nextStep: item.nextStep ?? "No next action recorded",
    owner: item.owner ?? "Unassigned",
    dueLabel: formatDueDate(item.dueAt),
    priority: item.priority.toLowerCase() as PriorityCase["priority"],
    status: item.status,
  }));
}

function mapRecentActivity(data: DashboardApiData): RecentActivityItem[] {
  return (data.recentActivity ?? []).map((item) => ({
    id: item.id,
    description: item.description,
    actor: item.actor,
    timestampLabel: item.timestamp
      ? new Date(item.timestamp).toLocaleString()
      : "Time unavailable",
  }));
}

function mapCoordinatorDashboard(data: DashboardApiData): DashboardSummary {
  return {
    stats: {
      activeCases: data.stats?.activeCases ?? 0,
      urgentCases: data.stats?.urgentCases ?? 0,
      overdueCases: data.stats?.overdueCases ?? 0,
      unassignedCases: data.stats?.unassignedCases ?? 0,
    },
    priorityCases: mapPriorityCases(data),
    careProgress: [],
    recentActivity: mapRecentActivity(data),
    referrals: {
      total: data.referrals?.total ?? 0,
      accepted: data.referrals?.accepted ?? 0,
      pending: data.referrals?.pending ?? 0,
      rejected: data.referrals?.rejected ?? 0,
    },
  };
}

function mapReferringDashboard(data: DashboardApiData): ReferringClinicianDashboard {
  return {
    assignedCases: data.stats?.assignedCases ?? 0,
    casesAwaitingReview: 0,
    referralsPending: data.referrals?.pending ?? 0,
    recentCases: (data.priorityCases ?? []).map((item) => ({
      id: item.caseId,
      patientLabel: item.patientLabel,
      screeningType: item.screeningType ?? "Screening",
      screeningResult: item.screeningResult ?? "Not recorded",
      priority: item.priority.toLowerCase() as "urgent" | "high" | "normal",
      status: item.status,
      nextAction: item.nextStep ?? "No next action recorded",
      dueLabel: formatDueDate(item.dueAt),
    })),
  };
}

function mapReceivingDashboard(
  data: DashboardApiData,
  referrals: IncomingReferral[],
): ReceivingClinicianDashboard {
  return {
    pendingReferrals: data.referrals?.pending ?? 0,
    acceptedReferrals: data.referrals?.accepted ?? 0,
    urgentReferrals: data.referrals?.urgent ?? 0,
    referrals,
  };
}

function mapFacilityAdminDashboard(
  data: DashboardApiData,
): FacilityAdministratorDashboard {
  return {
    staff: {
      totalStaff: data.staffAccess?.totalStaff ?? 0,
      activeStaff: data.staffAccess?.activeStaff ?? 0,
      inactiveStaff: data.staffAccess?.inactiveStaff ?? 0,
      pendingAccess: 0,
    },
    facilityConnections: data.facility
      ? [
          {
            id: data.facility.id,
            facilityName: data.facility.name,
            connectionStatus:
              data.connection?.status === "DEMO"
                ? "connected"
                : "pending",
            lastChecked: data.generatedAt
              ? new Date(data.generatedAt).toLocaleString()
              : "Not available",
          },
        ]
      : [],
  };
}

function DashboardPage() {
  const { activeUser } = useUser();

  const [dashboard, setDashboard] = useState<
    | DashboardSummary
    | ReferringClinicianDashboard
    | ReceivingClinicianDashboard
    | FacilityAdministratorDashboard
    | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

  const loadDashboard = useCallback(async () => {
        if (!activeUser) {
      setDashboard(null);
      setError("Please sign in to view your dashboard.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const data = await getDashboardSummary();

      if (activeUser.role === "coordinator") {
        setDashboard(mapCoordinatorDashboard(data));
      } else if (activeUser.role === "referring_clinician") {
        setDashboard(mapReferringDashboard(data));
      } else if (activeUser.role === "receiving_clinician") {
        const response = await getReferrals();

const incoming: IncomingReferral[] = response.referrals.map((item) => ({
  id: item.id,
  patientLabel: item.patientLabel,
  screeningType: item.screeningType,
  priority: item.priority,
  referringFacility: item.referringFacility,
  referralReason: item.referralReason,
  receivedAt: item.createdAt,
  status: item.status,
}));
        setDashboard(mapReceivingDashboard(data, incoming));
      } else if (activeUser.role === "facility_administrator") {
        setDashboard(mapFacilityAdminDashboard(data));
      } else {
        setDashboard(null);
        setError("Your account role does not have a dashboard view.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load dashboard data.",
      );
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [activeUser]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleSelectReferral(referralId: string) {
    try {
      const response = await getReferrals();
      const referral = response.referrals.find((item) => item.id === referralId);

      if (!referral) {
        setError("Referral details could not be found.");
        return;
      }

      setSelectedReferral(referral);
    } catch {
      setError("Unable to load referral details.");
    }
  }

  if (loading) {
    return (
      <div className="dashboard-state">
        <div className="loading-spinner" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!activeUser) {
  return (
    <div className="dashboard-state">
      <p>Please sign in to continue.</p>
    </div>
  );
}

  if (error || !dashboard) {
    return (
      <div className="dashboard-state dashboard-error">
        <AlertCircle size={28} />
        <h2>Dashboard unavailable</h2>
        <p>{error ?? "No dashboard data was returned."}</p>
        <button onClick={loadDashboard}>Try again</button>
      </div>
    );
  }

  const roleTitles = {
    coordinator: "Coordinator Dashboard",
    referring_clinician: "Referring Clinician Dashboard",
    receiving_clinician: "Receiving Clinician Dashboard",
    facility_administrator: "Facility Administrator Dashboard",
  };

  return (
    <main className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">OVERVIEW</span>
          <h1>{roleTitles[activeUser.role]}</h1>
          <p>Welcome, {activeUser.name}. Here's your workspace overview.</p>
        </div>

        <div className="dashboard-date">
          <Clock size={15} />
          <span>Demo workspace overview</span>
        </div>
      </div>

      {"stats" in dashboard && (
        <CoordinatorDashboard dashboard={dashboard} />
      )}

      {"assignedCases" in dashboard && (
        <ReferringClinicianDashboardView dashboard={dashboard} />
      )}

      {"staff" in dashboard && (
        <FacilityAdministratorDashboardView dashboard={dashboard} />
      )}

      {"pendingReferrals" in dashboard && (
        <ReceivingClinicianDashboardView
          dashboard={dashboard}
          onSelectReferral={handleSelectReferral}
        />
      )}

      {selectedReferral && (
        <ReferralDetails
          referral={selectedReferral}
          onClose={() => setSelectedReferral(null)}
          onReferralUpdated={() => {
            setSelectedReferral(null);
            loadDashboard();
          }}
        />
      )}
    </main>
  );
}

function CoordinatorDashboard({
  dashboard,
}: {
  dashboard: DashboardSummary;
}) {
  const { stats } = dashboard;

  return (
    <>
      <section className="stats-grid">
        <StatCard
          label="Active cases"
          value={stats.activeCases}
          description="Cases currently being tracked"
          icon={Users}
          tone="navy"
        />
        <StatCard
          label="Urgent cases"
          value={stats.urgentCases}
          description="Require immediate attention"
          icon={AlertCircle}
          tone="coral"
        />
        <StatCard
          label="Overdue cases"
          value={stats.overdueCases}
          description="Past their expected next step"
          icon={Clock}
          tone="amber"
        />
        <StatCard
          label="Unassigned cases"
          value={stats.unassignedCases}
          description="Awaiting a case owner"
          icon={Activity}
          tone="teal"
        />
      </section>

      <section className="dashboard-main-grid">
        <PriorityQueue cases={dashboard.priorityCases} />
        <CareProgress stages={dashboard.careProgress} />
      </section>

      <section className="dashboard-bottom-grid">
        <ReferralOverview referrals={dashboard.referrals} />
        <RecentActivity activities={dashboard.recentActivity} />
      </section>
    </>
  );
}

function ReferringClinicianDashboardView({
  dashboard,
}: {
  dashboard: ReferringClinicianDashboard;
}) {
  const navigate = useNavigate();

  return (
    <>
      <section className="stats-grid">
        <StatCard
          label="Assigned cases"
          value={dashboard.assignedCases}
          description="Cases assigned to you"
          icon={Users}
          tone="navy"
        />
        <StatCard
          label="Awaiting review"
          value={dashboard.casesAwaitingReview}
          description="Not yet available from the API"
          icon={AlertCircle}
          tone="coral"
        />
        <StatCard
          label="Pending referrals"
          value={dashboard.referralsPending}
          description="Awaiting referral response"
          icon={Clock}
          tone="teal"
        />
      </section>

      <section className="dashboard-section">
        <h2>Cases requiring attention</h2>

        {dashboard.recentCases.length === 0 ? (
          <p>No cases currently require attention.</p>
        ) : (
          dashboard.recentCases.map((item) => (
            <div className="dashboard-list-item" key={item.id}>
              <div>
                <strong>{item.id} · {item.patientLabel}</strong>
                <p>{item.screeningType} — {item.screeningResult}</p>
                <p>{item.nextAction}</p>
              </div>

              <div className="dashboard-case-actions">
                <span
                  className={`dashboard-due-label ${
                    item.dueLabel.toLowerCase().includes("overdue")
                      ? "overdue"
                      : "normal"
                  }`}
                >
                  {item.dueLabel}
                </span>

                <button
                  type="button"
                  className="dashboard-action-button"
                  onClick={() =>
                    navigate(`/worklist?caseId=${item.id}`, {
                      state: { returnTo: "/" },
                    })
                  }
                >
                  Open case
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
}

function ReceivingClinicianDashboardView({
  dashboard,
  onSelectReferral,
}: {
  dashboard: ReceivingClinicianDashboard;
  onSelectReferral: (referralId: string) => void;
}) {
  return (
    <>
      <section className="stats-grid">
        <StatCard
          label="Pending referrals"
          value={dashboard.pendingReferrals}
          description="Awaiting your decision"
          icon={Clock}
          tone="amber"
        />
        <StatCard
          label="Accepted referrals"
          value={dashboard.acceptedReferrals}
          description="Accepted by you"
          icon={CheckCircle}
          tone="teal"
        />
        <StatCard
          label="Urgent referrals"
          value={dashboard.urgentReferrals}
          description="Require priority attention"
          icon={AlertCircle}
          tone="coral"
        />
      </section>

      <section className="dashboard-section">
        <h2>Incoming referrals</h2>

        {dashboard.referrals.length === 0 ? (
          <p>No incoming referrals at the moment.</p>
        ) : (
          dashboard.referrals.map((referral) => (
            <div
              className="dashboard-list-item incoming-referral-item"
              key={referral.id}
              onClick={() => onSelectReferral(referral.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectReferral(referral.id);
                }
              }}
            >
              <div>
                <strong>{referral.id} · {referral.patientLabel}</strong>
                <p>{referral.screeningType}</p>
                <p>From: {referral.referringFacility}</p>
                <p>{referral.referralReason}</p>
              </div>
              <span>{referral.status.replace("_", " ")}</span>
            </div>
          ))
        )}
      </section>
    </>
  );
}

function FacilityAdministratorDashboardView({
  dashboard,
}: {
  dashboard: FacilityAdministratorDashboard;
}) {
  return (
    <>
      <section className="stats-grid">
        <StatCard
          label="Total staff"
          value={dashboard.staff.totalStaff}
          description="Registered staff profiles"
          icon={Users}
          tone="navy"
        />
        <StatCard
          label="Active staff"
          value={dashboard.staff.activeStaff}
          description="Currently active accounts"
          icon={UserCheck}
          tone="teal"
        />
        <StatCard
          label="Inactive staff"
          value={dashboard.staff.inactiveStaff}
          description="Inactive accounts"
          icon={Users}
          tone="amber"
        />
        <StatCard
          label="Pending access"
          value={dashboard.staff.pendingAccess}
          description="Not currently tracked"
          icon={AlertCircle}
          tone="coral"
        />
      </section>

      <section className="dashboard-section">
        <h2>Facility connections</h2>

        {dashboard.facilityConnections.map((facility) => (
          <div className="dashboard-list-item" key={facility.id}>
            <div>
              <strong>
                <Building2 size={16} /> {facility.facilityName}
              </strong>
              <p>Last checked: {facility.lastChecked}</p>
            </div>
            <span>{facility.connectionStatus}</span>
          </div>
        ))}
      </section>
    </>
  );
}

export default DashboardPage;
