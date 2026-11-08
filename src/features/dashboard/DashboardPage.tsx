
import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  Clock,
  Users,
} from "lucide-react";

import StatCard from "./components/StatCard";
import PriorityQueue from "./components/PriorityQueue";
import CareProgress from "./components/CareProgress";
import ReferralOverview from "./components/ReferralOverview";
import RecentActivity from "./components/RecentActivity";
import "./dashboard.css";
import { getDashboardSummary } from "../../services/api/dashboardService";
import type { DashboardSummary } from "./dashboard.types";

function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError(null);

      const data = await getDashboardSummary();
      setDashboard(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

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
        <button onClick={loadDashboard}>Try again</button>
      </div>
    );
  }

  const { stats } = dashboard;

  return (
    <main className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="dashboard-eyebrow">OVERVIEW</span>
          <h1>Dashboard</h1>
          <p>
            Monitor cases, track care progression and stay on top
            of what needs attention.
          </p>
        </div>
        <div className="dashboard-date">
          <Clock size={15} />
          <span>Live workspace overview</span>
        </div>
      </div>

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
    </main>
  );
}

export default DashboardPage;
