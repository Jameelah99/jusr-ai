import { useEffect, useState } from "react";
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
import { getDashboardSummary } from "../../services/api/dashboardService";

import type {
  DashboardData,
  DashboardSummary,
  ReferringClinicianDashboard,
  ReceivingClinicianDashboard,
  FacilityAdministratorDashboard,
} from "./dashboard.types";

import "./dashboard.css";

function DashboardPage() {
  const { activeUser } = useUser();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null,
  );

  async function loadDashboard(role = activeUser.role) {
    try {
      setLoading(true);
      setError(null);

      const data = await getDashboardSummary(role, activeUser.facility.id);
      setDashboard(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load dashboard data.",
      );
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard(activeUser.role);
  }, [activeUser.role]);

  async function handleSelectReferral(referralId: string) {
    try {
      const response = await getReferrals();

      const referral = response.referrals.find(
        (item) => item.id === referralId,
      );

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

  if (error || !dashboard) {
    return (
      <div className="dashboard-state dashboard-error">
        <AlertCircle size={28} />
        <h2>Dashboard unavailable</h2>
        <p>{error ?? "No dashboard data was returned."}</p>
        <button onClick={() => loadDashboard()}>Try again</button>
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

      {"stats" in dashboard && <CoordinatorDashboard dashboard={dashboard} />}

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
          onReferralUpdated={(updatedReferral) => {
            setSelectedReferral(updatedReferral);
            loadDashboard();
          }}
        />
      )}
    </main>
  );
}

function CoordinatorDashboard({ dashboard }: { dashboard: DashboardSummary }) {
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
          description="Require clinical review"
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

        {dashboard.recentCases.map((item) => (
          <div className="dashboard-list-item" key={item.id}>
            <div>
              <strong>
                {item.id} · {item.patientLabel}
              </strong>
              <p>
                {item.screeningType} — {item.screeningResult}
              </p>
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
                onClick={() => {
                  if (item.nextAction.toLowerCase().includes("consultation")) {
                    navigate(`/consultations?caseId=${item.id}`);
                  } else {
                    navigate(`/worklist?caseId=${item.id}`, {
                      state: {
                        returnTo: "/",
                      },
                    });
                  }
                }}
              >
                Open case
              </button>
            </div>
          </div>
        ))}
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

        {dashboard.referrals.map((referral) => (
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
              <strong>
                {referral.id} · {referral.patientLabel}
              </strong>
              <p>{referral.screeningType}</p>
              <p>From: {referral.referringFacility}</p>
              <p>{referral.referralReason}</p>
            </div>
            <span>{referral.status.replace("_", " ")}</span>
          </div>
        ))}
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
          description="Awaiting access review"
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
