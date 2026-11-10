
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import type { ReferralSummary } from "../referrals.types";

interface ReferralStatsProps {
  summary: ReferralSummary;
}

function ReferralStats({ summary }: ReferralStatsProps) {
  const stats = [
    {
      label: "Total referrals",
      value: summary.totalReferrals,
      icon: ClipboardList,
      color: "navy",
    },
    {
      label: "Awaiting response",
      value: summary.pendingReferrals,
      icon: Clock3,
      color: "amber",
    },
    {
      label: "Accepted",
      value: summary.acceptedReferrals,
      icon: CheckCircle2,
      color: "green",
    },
    {
      label: "Rejected",
      value: summary.rejectedReferrals,
      icon: XCircle,
      color: "coral",
    },
    {
      label: "Escalated",
      value: summary.escalatedReferrals,
      icon: AlertTriangle,
      color: "purple",
    },
  ];

  return (
    <section className="referral-stats">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article className="referral-stat-card" key={stat.label}>
            <div className={`referral-stat-icon ${stat.color}`}>
              <Icon size={19} />
            </div>

            <div>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default ReferralStats;
