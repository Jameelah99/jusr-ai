import { useCallback, useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import {
  acceptUrgentCase,
  getUrgentCases,
  type UrgentCase,
} from "../../features/urgent-inbox/urgentRoutingService";
import "./urgentInbox.css";

function UrgentInboxPage() {
  const { activeUser } = useUser();
  const [cases, setCases] = useState<UrgentCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const loadInbox = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setCases(await getUrgentCases());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load incoming urgent cases.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeUser) void loadInbox();
    else setLoading(false);
  }, [activeUser, loadInbox]);

  async function handleAccept(caseId: string) {
    try {
      setAcceptingId(caseId);
      setError("");
      setSuccessMessage("");
      await acceptUrgentCase(caseId);
      setSuccessMessage(`${caseId} has been accepted successfully.`);
      await loadInbox();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to accept this urgent case.");
    } finally {
      setAcceptingId(null);
    }
  }

  if (!activeUser) {
    return <div className="page-container"><div className="dashboard-placeholder">Loading your account...</div></div>;
  }

  return (
    <div className="page-container">
      <div className="page-heading">
        <div>
          <h1>Incoming Urgent Cases</h1>
          <p>Review urgent cases routed to you for clinical attention.</p>
        </div>
      </div>

      {successMessage && <div className="success-message" role="status">{successMessage}</div>}
      {error && <div className="error-message" role="alert">{error}</div>}

      {loading ? (
        <div className="dashboard-placeholder">Loading incoming cases...</div>
      ) : cases.length === 0 ? (
        <div className="dashboard-placeholder">
          <h2>No pending urgent cases</h2>
          <p>Urgent cases routed to your clinical profile will appear here.</p>
        </div>
      ) : (
        <div className="urgent-inbox-list">
          {cases.map((caseItem) => (
            <div className="urgent-inbox-card" key={caseItem.id}>
              <div className="urgent-inbox-card-header">
                <div>
                  <span className="urgent-case-label">URGENT</span>
                  <h2>{caseItem.caseId}</h2>
                  <p>{caseItem.patientLabel}</p>
                </div>
                <span className="urgent-routing-status">
                  {caseItem.routingStatus === "EXCEPTION"
                    ? "Routing exception"
                    : caseItem.routingStatus === "ACCEPTED"
                      ? "Accepted"
                      : "Awaiting acceptance"}
                </span>
              </div>

              <div className="urgent-inbox-details">
                <div><span>Screening type</span><strong>{caseItem.screeningType}</strong></div>
                <div><span>Required specialty</span><strong>{caseItem.requiredSpecialty ?? "Not specified"}</strong></div>
                <div><span>Assigned clinician</span><strong>{caseItem.routedClinician?.displayName ?? "Not assigned"}</strong></div>
                <div><span>Referring facility</span><strong>{caseItem.facility}</strong></div>
                {caseItem.dueAt && <div><span>Acceptance due</span><strong>{new Date(caseItem.dueAt).toLocaleString()}</strong></div>}
                {caseItem.exceptionReason && <div><span>Routing exception</span><strong>{caseItem.exceptionReason}</strong></div>}
              </div>

              {caseItem.routingStatus === "AWAITING_ACCEPTANCE" && (
                <div className="urgent-inbox-action">
                  <button
                    type="button"
                    onClick={() => void handleAccept(caseItem.caseId)}
                    disabled={acceptingId !== null}
                  >
                    {acceptingId === caseItem.caseId ? "Accepting..." : "Accept case"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UrgentInboxPage;
