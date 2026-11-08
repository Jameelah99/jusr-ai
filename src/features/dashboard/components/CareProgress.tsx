
import type { CareStage } from "../dashboard.types";

interface CareProgressProps {
  stages: CareStage[];
}

function CareProgress({ stages }: CareProgressProps) {
  return (
    <section className="dashboard-panel">
      <div className="panel-heading">
        <div>
          <h2>Screening-to-care progress</h2>
          <p>Patient progression across care stages</p>
        </div>
      </div>

      {stages.length === 0 ? (
        <div className="empty-state">
          <p>No care progression data available.</p>
        </div>
      ) : (
        <div className="progress-list">
          {stages.map((stage) => {
            const percentage = Math.min(
              100,
              Math.max(0, stage.percentage)
            );

            return (
              <div className="progress-item" key={stage.label}>
                <div className="progress-label">
                  <span>{stage.label}</span>
                  <strong>{stage.count.toLocaleString()}</strong>
                </div>

                <div
                  className="progress-track"
                  role="progressbar"
                  aria-label={stage.label}
                  aria-valuenow={percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="progress-percentage">
                  {percentage}% of actionable cases
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default CareProgress;
