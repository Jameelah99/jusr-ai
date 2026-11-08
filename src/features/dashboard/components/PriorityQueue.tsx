
import {
  AlertCircle,
  Clock3,
  UserRound,
  ArrowRight,
} from "lucide-react";

import type { PriorityCase } from "../dashboard.types";
import { Link } from "react-router-dom";

interface PriorityQueueProps {
  cases: PriorityCase[];
}

function PriorityQueue({ cases }: PriorityQueueProps) {
  return (
    <section className="dashboard-panel">
      <div className="panel-heading">
        <div>
          <h2>Priority queue</h2>
          <p>Cases requiring attention</p>
        </div>

        <span className="panel-count">
          {cases.length} cases
        </span>
      </div>

      <div className="priority-list">
        {cases.length === 0 ? (
          <div className="empty-state">
            <p>No priority cases at the moment.</p>
          </div>
        ) : (
          cases.map((item) => (
            <article className="priority-item" key={item.id}>
              <div className={`priority-indicator priority-${item.priority}`}>
                <AlertCircle size={18} />
              </div>

              <div className="priority-details">
                <div className="priority-title-row">
                  <h3>{item.patientLabel}</h3>

                  <span className={`priority-badge badge-${item.priority}`}>
                    {item.priority}
                  </span>
                </div>

                <p>{item.screeningResult}</p>

                <div className="priority-meta">
                  <span>
                    Next: {item.nextStep}
                  </span>

                  <span>
                    <UserRound size={12} />
                    {" "}
                    {item.owner ?? "Unassigned"}
                  </span>
                </div>
              </div>

              <div className="priority-deadline">
                <span>
                  <Clock3 size={12} />
                  {" "}
                  {item.dueLabel}
                </span>

                <small>{item.status}</small>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="priority-footer">
        <Link to="/worklist">
          View all cases <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}

export default PriorityQueue;
