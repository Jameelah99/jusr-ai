
import {
  Users,
  AlertCircle,
  Clock3,
  UserRoundX,
} from "lucide-react";

import type { WorklistSummary } from "../worklist.types";

interface WorklistStatsProps {
  summary: WorklistSummary;
}

function WorklistStats({ summary }: WorklistStatsProps) {
  const stats = [
    {
      label: "Total cases",
      value: summary.totalCases,
      description: "Cases in the worklist",
      icon: Users,
      tone: "navy",
    },
    {
      label: "Urgent cases",
      value: summary.urgentCases,
      description: "Require immediate attention",
      icon: AlertCircle,
      tone: "coral",
    },
    {
      label: "Overdue cases",
      value: summary.overdueCases,
      description: "Past their expected next step",
      icon: Clock3,
      tone: "amber",
    },
    {
      label: "Unassigned cases",
      value: summary.unassignedCases,
      description: "Awaiting a case owner",
      icon: UserRoundX,
      tone: "teal",
    },
  ] as const;

  return (
    <section className="worklist-stats">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article
            className={`worklist-stat-card stat-${stat.tone}`}
            key={stat.label}
          >
            <div className="worklist-stat-top">
              <span>{stat.label}</span>

              <div className="stat-icon">
                <Icon size={19} strokeWidth={2} />
              </div>
            </div>

            <div className="worklist-stat-value">
              {stat.value.toLocaleString()}
            </div>

            <p>{stat.description}</p>
          </article>
        );
      })}
    </section>
  );
}

export default WorklistStats;
