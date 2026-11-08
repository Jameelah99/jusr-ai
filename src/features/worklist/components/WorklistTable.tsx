
import { ChevronRight, UserRound } from "lucide-react";

import type { WorklistCase } from "../worklist.types";
import PriorityBadge from "./PriorityBadge";

interface WorklistTableProps {
  cases: WorklistCase[];
  onSelectCase: (caseItem: WorklistCase) => void;
}

function WorklistTable({ cases, onSelectCase }: WorklistTableProps) {
  return (
    <section className="worklist-table-panel">
      <div className="worklist-table-heading">
        <div>
          <h2>Case worklist</h2>
          <p>Review and manage cases requiring follow-up.</p>
        </div>

        <span className="worklist-result-count">
          {cases.length} cases
        </span>
      </div>

      <div className="worklist-table-scroll">
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
              <th> </th>
            </tr>
          </thead>

          <tbody>
            {cases.length === 0 ? (
              <tr>
                <td colSpan={8} className="worklist-empty">
                  No cases match your filters.
                </td>
              </tr>
            ) : (
              cases.map((item) => (
                <tr
  key={item.id}
  onClick={() => onSelectCase(item)}
  className="worklist-clickable-row"
>
                  <td>
                    <div className="worklist-patient">
                      <strong>{item.patientLabel}</strong>
                      <span>{item.id}</span>
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
                    <span className="worklist-status">
                      {item.status}
                    </span>
                  </td>

                  <td>
                    <span className="worklist-assignee">
                      <UserRound size={14} />
                      {item.assignedTo ?? "Unassigned"}
                    </span>
                  </td>

                  <td>{item.nextAction}</td>

                  <td>
                    {item.dueDate
                      ? new Date(`${item.dueDate}T00:00:00`).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "Not set"}
                  </td>

                  <td>
                    <button
                      type="button"
                      className="worklist-view-button"
                      onClick={() => onSelectCase(item)}
                      aria-label={`View ${item.id}`}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default WorklistTable;
