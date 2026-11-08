
import { Activity, Clock3 } from "lucide-react";
import type { RecentActivityItem } from "../dashboard.types";

interface RecentActivityProps {
  activities: RecentActivityItem[];
}

function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <section className="dashboard-panel">
      <div className="panel-heading">
        <div>
          <h2>Recent activity</h2>
          <p>Latest updates across your workspace</p>
        </div>
        <Activity size={19} />
      </div>

      {activities.length === 0 ? (
        <div className="empty-state">
          <p>No recent activity to display.</p>
        </div>
      ) : (
        <div className="activity-list">
          {activities.map((item) => (
            <article className="activity-item" key={item.id}>
              <div className="activity-marker">
                <Activity size={15} />
              </div>

              <div className="activity-content">
                <p>{item.description}</p>

                <div className="activity-meta">
                  <span>{item.actor}</span>
                  <span>
                    <Clock3 size={12} />
                    {item.timestampLabel}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentActivity;
