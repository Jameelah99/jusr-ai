
import { useCallback, useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import {
  getUrgentCases,
  acceptUrgentCase,
  type UrgentCase,
} from "./urgentRoutingService";

function UrgentInboxPage() {
  const { activeUser, isLoading: userLoading } = useUser();

  const [cases, setCases] = useState<UrgentCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const loadCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getUrgentCases();
      setCases(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load urgent cases.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userLoading && activeUser) {
      loadCases();
    }
  }, [userLoading, activeUser, loadCases]);

  async function handleAccept(caseId: string) {
    try {
      setAcceptingId(caseId);
      setError(null);

      await acceptUrgentCase(caseId);
      await loadCases();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to accept this urgent case.",
      );
    } finally {
      setAcceptingId(null);
    }
  }

  if (userLoading || loading) {
    return (
      <main className="page-container">
        <p>Loading urgent cases...</p>
      </main>
    );
  }

  if (activeUser?.role !== "receiving_clinician") {
    return (
      <main className="page-container">
        <div className="page-heading">
          <div>
            <span className="worklist-eyebrow">CLINICAL WORKSPACE</span>
            <h1>Incoming urgent cases</h1>
          </div>
        </div>
        <p>This inbox is available to receiving clinicians.</p>
      </main>
    );
  }

  return (
    <main className="page-container">
      <div className="page-heading">
        <div>
          <span className="worklist-eyebrow">CLINICAL WORKSPACE</span>
          <h1>Incoming urgent cases</h1>
          <p>
            Review urgent cases routed to you for specialty acceptance.
          </p>
        </div>

        <button type="button" onClick={loadCases} disabled={loading}>
          Refresh inbox
        </button>
      </div>

      <div className="dashboard-placeholder">
        <h2>Your urgent case inbox</h2>
        <p>
          {cases.length} urgent {cases.length === 1 ? "case" : "cases"} found
        </p>
      </div>

      {error && (
        <div className="error-message" role="alert">
          <p>{error}</p>
          <button type="button" onClick={loadCases}>
            Try again
          </button>
        </div>
      )}

      {!error && cases.length === 0 && (
        <div className="dashboard-placeholder">
          <h2>No urgent cases awaiting your attention</h2>
          <p>
            Cases routed to your clinical profile will appear here.
          </p>
        </div>
      )}

      <div className="urgent-case-list">
        {cases.map((item) => (
          <article className="dashboard-placeholder" key={item.id}>
            <div>
              <span className="worklist-eyebrow">
                URGENT CASE
              </span>

              <h2>{item.patientLabel}</h2>

              <p>
                Case reference: {item.caseId}
              </p>

              <p>
                Age: {item.age ?? "Not recorded"}
              </p>

              <p>
                Screening type: {item.screeningType}
              </p>

              <p>
                Screening result: {item.screeningResult ?? "Not recorded"}
              </p>

              <p>
                Required specialty: {item.requiredSpecialty ?? "Not specified"}
              </p>

              <p>
                Routing status: {item.routingStatus.replaceAll("_", " ")}
              </p>

              <p>
                Routed clinician:{" "}
                {item.routedClinician?.displayName ?? "Not recorded"}
              </p>

              <p>
                Response deadline:{" "}
                {item.dueAt
                  ? new Date(item.dueAt).toLocaleString()
                  : "Not specified"}
              </p>

              {item.exceptionReason && (
                <p>
                  Routing exception: {item.exceptionReason}
                </p>
              )}
            </div>

            {item.routingStatus === "AWAITING_ACCEPTANCE" && (
              <button
                type="button"
                onClick={() => handleAccept(item.caseId)}
                disabled={acceptingId !== null}
              >
                {acceptingId === item.caseId
                  ? "Accepting..."
                  : "Accept case"}
              </button>
            )}

            {item.routingStatus === "ACCEPTED" && (
              <p>Case accepted.</p>
            )}

            {item.routingStatus === "EXCEPTION" && (
              <p>Routing exception requires attention.</p>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}

export default UrgentInboxPage;
