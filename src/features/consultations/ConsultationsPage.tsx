
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import {
  getConsultations,
  recordConsultationOutcome,
} from "./consultationsService";
import type { Consultation } from "./consultations.types";
import "./consultations.css";

function formatStatus(status: Consultation["status"]) {
  return status.replaceAll("_", " ");
}

export default function ConsultationsPage() {
  const { activeUser } = useUser();
  const [searchParams] = useSearchParams();
  const selectedCaseId = searchParams.get("caseId");

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [feedbackConsultationId, setFeedbackConsultationId] = useState("");

  const loadConsultations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getConsultations();
      setConsultations(response.consultations);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load consultations."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConsultations();
  }, [loadConsultations]);

  const selectedConsultation = consultations.find(
    (consultation) => consultation.caseId === selectedCaseId
  );

  async function handleRecordOutcome(consultationId: string) {
    const outcome = window.prompt(
      "Enter the consultation outcome and clinical note:"
    );

    if (!outcome?.trim()) return;

    try {
      setActionLoading(true);
      setActionMessage("");
      setActionError("");
      setFeedbackConsultationId(consultationId);

      await recordConsultationOutcome(consultationId, {
        outcome: outcome.trim(),
        outcomeNote: "",
      });

      await loadConsultations();
      setActionMessage("Consultation outcome recorded successfully.");
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to record consultation outcome."
      );
    } finally {
      setActionLoading(false);
    }
  }

  function renderConsultation(consultation: Consultation) {
    const canRecordOutcome =
      activeUser?.role === "receiving_clinician" &&
      consultation.status === "ACCEPTED";

    return (
      <article className="consultation-card" key={consultation.id}>
        <h3>{consultation.patientLabel}</h3>

        <p>
          {consultation.caseId} · {consultation.screeningType}
        </p>

        <p>
          <strong>Priority:</strong> {consultation.priority}
        </p>

        <p>
          <strong>Referring facility:</strong>{" "}
          {consultation.referringFacility}
        </p>

        <p>
          <strong>Receiving facility:</strong>{" "}
          {consultation.receivingFacility}
        </p>

        <p>
          <strong>Referring clinician:</strong>{" "}
          {consultation.referringClinician}
        </p>

        <p>
          <strong>Status:</strong> {formatStatus(consultation.status)}
        </p>

        <p>{consultation.reason}</p>

        {consultation.status === "OUTCOME_RECORDED" && (
          <div className="consultation-outcome">
            <h4>Consultation Outcome</h4>
            <p>{consultation.outcome || "No outcome recorded."}</p>

            {consultation.outcomeRecordedAt && (
              <p>
                <strong>Recorded:</strong>{" "}
                {new Date(
                  consultation.outcomeRecordedAt
                ).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {canRecordOutcome && (
          <div className="consultation-actions">
            <button
              type="button"
              className="dashboard-action-button"
              disabled={actionLoading}
              onClick={() => handleRecordOutcome(consultation.id)}
            >
              {actionLoading &&
              feedbackConsultationId === consultation.id
                ? "Saving..."
                : "Record Outcome"}
            </button>
          </div>
        )}

        {feedbackConsultationId === consultation.id && actionMessage && (
          <p className="success-message">{actionMessage}</p>
        )}

        {feedbackConsultationId === consultation.id && actionError && (
          <p className="error-message">{actionError}</p>
        )}
      </article>
    );
  }

  if (loading) {
    return <div className="page-container">Loading consultations...</div>;
  }

  if (error) {
    return <div className="page-container">{error}</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Consultations</h1>
          <p>
            View accepted referrals and record specialist consultation
            outcomes.
          </p>
        </div>
      </div>

      {selectedCaseId && (
        <div className="selected-consultation">
          <h2>Selected Consultation</h2>
          {selectedConsultation ? (
            renderConsultation(selectedConsultation)
          ) : (
            <p>No consultation found for case {selectedCaseId}.</p>
          )}
        </div>
      )}

      <div className="consultations-list">
        <h2>
          {selectedConsultation ? "Other Consultations" : "All Consultations"}
        </h2>

        {consultations.filter(
          (consultation) => consultation.id !== selectedConsultation?.id
        ).length === 0 ? (
          <p>No consultations available.</p>
        ) : (
          consultations
            .filter(
              (consultation) => consultation.id !== selectedConsultation?.id
            )
            .map(renderConsultation)
        )}
      </div>
    </div>
  );
}
