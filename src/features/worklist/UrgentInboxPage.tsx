import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import {
  acceptUrgentCase,
  getUrgentInbox,
} from "./urgentInbox.service";
import type { WorklistCase } from "./worklist.types";
import "./urgentInbox.css";

function UrgentInboxPage() {
  const { activeUser } = useUser();

  const [cases, setCases] = useState<WorklistCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  async function loadInbox() {
    try {
      setLoading(true);
      setError("");

      const data = await getUrgentInbox(activeUser.id);
      setCases(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load incoming urgent cases."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInbox();
  }, [activeUser.id]);

  async function handleAccept(caseId: string) {
    try {
      setAcceptingId(caseId);
      setError("");
      setSuccessMessage("");

      await acceptUrgentCase(caseId, activeUser.id);

      setCases((currentCases) =>
        currentCases.filter((item) => item.id !== caseId)
      );

      setSuccessMessage(`${caseId} has been accepted successfully.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to accept this urgent case."
      );
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <h1>Incoming Urgent Cases</h1>
          <p>
            Review urgent cases routed to you for clinical attention.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="dashboard-placeholder">
          Loading incoming cases...
        </div>
      ) : cases.length === 0 ? (
        <div className="dashboard-placeholder">
          <h2>No pending urgent cases</h2>
          <p>
            Urgent cases assigned to you will appear here.
          </p>
        </div>
      ) : (
        <div className="urgent-inbox-list">
          {cases.map((caseItem) => (
            <div className="urgent-inbox-card" key={caseItem.id}>
              <div className="urgent-inbox-card-header">
                <div>
                  <span className="urgent-case-label">
                    URGENT
                  </span>
                  <h2>{caseItem.id}</h2>
                  <p>{caseItem.patientLabel}</p>
                </div>

                <span className="urgent-routing-status">
                  Awaiting acceptance
                </span>
              </div>

              <div className="urgent-inbox-details">
                <div>
                  <span>Screening type</span>
                  <strong>{caseItem.screeningType}</strong>
                </div>

                <div>
                  <span>Required specialty</span>
                  <strong>{caseItem.specialty ?? "Not specified"}</strong>
                </div>

                <div>
                  <span>Assigned clinician</span>
                  <strong>{caseItem.assignedTo}</strong>
                </div>

                <div>
                  <span>Referring facility</span>
                  <strong>{caseItem.facility}</strong>
                </div>
              </div>

              <div className="urgent-inbox-action">
                <button
                  type="button"
                  onClick={() => void handleAccept(caseItem.id)}
                  disabled={acceptingId !== null}
                >
                  {acceptingId === caseItem.id
                    ? "Accepting..."
                    : "Accept case"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UrgentInboxPage;