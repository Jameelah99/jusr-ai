
import { ChevronRight, UserRound } from "lucide-react";
import type { WorklistCase } from "../worklist.types";
import PriorityBadge from "./PriorityBadge";

interface WorklistTableProps {
  cases: WorklistCase[];
  onSelectCase: (caseItem: WorklistCase) => void;
}

function getShortId(id: string) {
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}

function formatDueDate(date: string | null) {
  if (!date) return "Not set";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function WorklistTable({ cases, onSelectCase }: WorklistTableProps) {
  return (
    <section className="worklist-table-panel">
      <div className="worklist-table-heading">
        <div>
          <h2>Case worklist</h2>
          <p>Review and manage cases requiring follow-up.</p>
        </div>

        <span className="worklist-result-count">{cases.length} cases</span>
      </div>

      {cases.length === 0 ? (
        <div className="worklist-empty">
          No cases match your filters.
        </div>
      ) : (
        <>
          <div className="worklist-table-scroll worklist-desktop-table">
            <table className="worklist-table">
              <thead>
                <tr>
                  <th>Patient / Case</th>
                  <th>Screening</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned to</th>
                  <th>Next action</th>
                  <th>Due date</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {cases.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectCase(item)}
                    className="worklist-clickable-row"
                  >
                    <td>
                      <div className="worklist-patient">
                        <strong>{item.patientLabel}</strong>
                        <span className="worklist-short-id" title={item.id}>
                          {getShortId(item.id)}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="worklist-screening">
                        <strong>{item.screeningType}</strong>
                        <span>{item.screeningResult}</span>
                      </div>
                    </td>

                    <td>
                      <PriorityBadge priority={item.priority} />
                    </td>

                    <td>
                      <span className="worklist-status" title={item.status}>
                        {item.status.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td>
                      <span className="worklist-assignee">
                        <UserRound size={14} />
                        <span>{item.assignedTo ?? "Unassigned"}</span>
                      </span>
                    </td>

                    <td className="worklist-next-action">
                      {item.nextAction}
                    </td>

                    <td>{formatDueDate(item.dueDate)}</td>

                    <td>
                      <button
                        type="button"
                        className="worklist-view-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectCase(item);
                        }}
                        aria-label={`View case ${getShortId(item.id)}`}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="worklist-mobile-cards">
            {cases.map((item) => (
              <button
                type="button"
                key={item.id}
                className="worklist-mobile-card"
                onClick={() => onSelectCase(item)}
              >
                <div className="worklist-mobile-card-top">
                  <div className="worklist-patient">
                    <strong>{item.patientLabel}</strong>
                    <span className="worklist-short-id" title={item.id}>
                      {getShortId(item.id)}
                    </span>
                  </div>

                  <PriorityBadge priority={item.priority} />
                </div>

                <div className="worklist-mobile-screening">
                  <strong>{item.screeningType}</strong>
                  <span>{item.screeningResult}</span>
                </div>

                <div className="worklist-mobile-details">
                  <div>
                    <span>Status</span>
                    <strong>{item.status.replace(/_/g, " ")}</strong>
                  </div>

                  <div>
                    <span>Assigned to</span>
                    <strong>{item.assignedTo ?? "Unassigned"}</strong>
                  </div>

                  <div>
                    <span>Next action</span>
                    <strong>{item.nextAction}</strong>
                  </div>

                  <div>
                    <span>Due date</span>
                    <strong>{formatDueDate(item.dueDate)}</strong>
                  </div>
                </div>

                <div className="worklist-mobile-card-footer">
                  <span>View case details</span>
                  <ChevronRight size={18} />
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default WorklistTable;
