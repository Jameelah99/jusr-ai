import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import {
  getConsultations,
  acceptConsultation,
  escalateConsultation,
  recordConsultationOutcome,
} from "./consultationsService";
import type { Consultation, ConsultationStatus } from "./consultations.types";
import "./consultations.css";

function formatStatus(status: ConsultationStatus) {
  return status.replaceAll("_", " ");
}

export default function ConsultationsPage() {
  const { activeUser } = useUser();

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const [feedbackConsultationId, setFeedbackConsultationId] = useState("");

  const [searchParams] = useSearchParams();
  const selectedCaseId = searchParams.get("caseId");
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedConsultation = consultations.find(
    (consultation) => consultation.caseId === selectedCaseId,
  );

  async function handleAcceptConsultation(consultationId: string) {
    try {
      setFeedbackConsultationId(consultationId);
      setActionLoading(true);
      setActionMessage("");
      setActionError("");

      const response = await acceptConsultation(consultationId, {
        receivingClinician: activeUser.name,
      });

      setConsultations((previous) =>
        previous.map((consultation) =>
          consultation.id === consultationId
            ? response.consultation
            : consultation,
        ),
      );

      setActionMessage("Consultation accepted successfully.");
    } catch {
      setActionError("Unable to accept consultation. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEscalateConsultation(consultationId: string) {
    const reason = window.prompt("Please provide a reason for escalation:");

    if (!reason?.trim()) {
      return;
    }

    try {
      setActionLoading(true);
      setActionMessage("");
      setActionError("");
      setFeedbackConsultationId(consultationId);

      const response = await escalateConsultation(consultationId, {
        reason: reason.trim(),
      });

      setConsultations((previous) =>
        previous.map((consultation) =>
          consultation.id === consultationId
            ? response.consultation
            : consultation,
        ),
      );

      setActionMessage("Consultation escalated successfully.");
    } catch {
      setActionError("Unable to escalate consultation. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRecordOutcome(consultationId: string) {
    const outcome = window.prompt(
      "Enter consultation outcome (e.g. Assessment completed, Further care required):",
    );

    if (!outcome?.trim()) {
      return;
    }

    const outcomeNote = window.prompt("Enter the consultation outcome note:");

    if (!outcomeNote?.trim()) {
      return;
    }

    try {
      setActionLoading(true);
      setActionMessage("");
      setActionError("");
      setFeedbackConsultationId(consultationId);

      const response = await recordConsultationOutcome(consultationId, {
        outcome: outcome.trim(),
        outcomeNote: outcomeNote.trim(),
      });

      setConsultations((previous) =>
        previous.map((consultation) =>
          consultation.id === consultationId
            ? response.consultation
            : consultation,
        ),
      );

      setActionMessage("Consultation outcome recorded successfully.");
    } catch {
      setActionError(
        "Unable to record consultation outcome. Please try again.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    async function loadConsultations() {
      try {
        setLoading(true);
        setError("");

        const response = await getConsultations();
        setConsultations(response.consultations);
      } catch {
        setError("Unable to load consultations. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadConsultations();
  }, []);

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
          <p>Manage clinician consultation requests and outcomes.</p>
        </div>
      </div>

      {selectedCaseId && (
        <div className="selected-consultation">
          {selectedConsultation ? (
            <>
              <h2>Selected Consultation</h2>
              <h3>{selectedConsultation.patientLabel}</h3>

              <p>
                <strong>Consultation ID:</strong> {selectedConsultation.id}
              </p>

              <p>
                <strong>Case ID:</strong> {selectedConsultation.caseId}
              </p>

              <p>
                <strong>Screening:</strong> {selectedConsultation.screeningType}
              </p>

              <p>
                <strong>Priority:</strong> {selectedConsultation.priority}
              </p>

              <p>
                <strong>Referring facility:</strong>{" "}
                {selectedConsultation.referringFacility}
              </p>

              <p>
                <strong>Receiving facility:</strong>{" "}
                {selectedConsultation.receivingFacility}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {formatStatus(selectedConsultation.status)}
              </p>

              <p>{selectedConsultation.reason}</p>

              {selectedConsultation.status === "OUTCOME_RECORDED" && (
                <div className="consultation-outcome">
                  <h4>Consultation Outcome</h4>

                  <p>
                    <strong>Outcome:</strong>{" "}
                    {selectedConsultation.outcome || "No outcome recorded."}
                  </p>

                  <p>
                    <strong>Clinical Note:</strong>{" "}
                    {selectedConsultation.outcomeNote ||
                      "No clinical note recorded."}
                  </p>

                  {selectedConsultation.outcomeRecordedAt && (
                    <p>
                      <strong>Recorded:</strong>{" "}
                      {new Date(
                        selectedConsultation.outcomeRecordedAt,
                      ).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              <div className="consultation-actions">
                {activeUser.role === "receiving_clinician" &&
                  selectedConsultation.status === "REQUESTED" && (
                    <button
                      type="button"
                      className="dashboard-action-button"
                      disabled={actionLoading}
                      onClick={() =>
                        handleEscalateConsultation(selectedConsultation.id)
                      }
                    >
                      {actionLoading
                        ? "Escalating..."
                        : "Escalate Consultation"}
                    </button>
                  )}

                {activeUser.role === "receiving_clinician" &&
                  selectedConsultation.status === "REQUESTED" && (
                    <button
                      type="button"
                      className="dashboard-action-button"
                      disabled={actionLoading}
                      onClick={() =>
                        handleAcceptConsultation(selectedConsultation.id)
                      }
                    >
                      {actionLoading ? "Accepting..." : "Accept Consultation"}
                    </button>
                  )}
              </div>

              {activeUser.role === "receiving_clinician" &&
                selectedConsultation.status === "ACCEPTED" && (
                  <div className="consultation-actions">
                    <button
                      type="button"
                      className="dashboard-action-button"
                      disabled={actionLoading}
                      onClick={() =>
                        handleRecordOutcome(selectedConsultation.id)
                      }
                    >
                      {actionLoading ? "Saving..." : "Record Outcome"}
                    </button>
                  </div>
                )}

              {feedbackConsultationId === selectedConsultation.id &&
                actionMessage && (
                  <p className="success-message">{actionMessage}</p>
                )}

              {feedbackConsultationId === selectedConsultation.id &&
                actionError && <p className="error-message">{actionError}</p>}
            </>
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
          (consultation) => consultation.id !== selectedConsultation?.id,
        ).length === 0 ? (
          <p>No other consultations available.</p>
        ) : (
          consultations
            .filter(
              (consultation) => consultation.id !== selectedConsultation?.id,
            )
            .map((consultation) => (
              <article className="consultation-card" key={consultation.id}>
                <h3>{consultation.patientLabel}</h3>

                <p>
                  {consultation.caseId} · {consultation.screeningType}
                </p>

                <p>
                  <strong>Priority:</strong> {consultation.priority}
                </p>

                <p>
                  <strong>Facility:</strong> {consultation.receivingFacility}
                </p>

                <p>
                  <strong>Status:</strong> {formatStatus(consultation.status)}
                </p>

                <p>{consultation.reason}</p>

                {consultation.status === "OUTCOME_RECORDED" && (
                  <div className="consultation-outcome">
                    <h4>Consultation Outcome</h4>

                    <p>
                      <strong>Outcome:</strong>{" "}
                      {consultation.outcome || "No outcome recorded."}
                    </p>

                    <p>
                      <strong>Clinical Note:</strong>{" "}
                      {consultation.outcomeNote || "No clinical note recorded."}
                    </p>

                    {consultation.outcomeRecordedAt && (
                      <p>
                        <strong>Recorded:</strong>{" "}
                        {new Date(
                          consultation.outcomeRecordedAt,
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                <div className="consultation-actions">
                  {activeUser.role === "receiving_clinician" &&
                    consultation.status === "REQUESTED" && (
                      <button
                        type="button"
                        className="dashboard-action-button"
                        disabled={actionLoading}
                        onClick={() =>
                          handleEscalateConsultation(consultation.id)
                        }
                      >
                        {actionLoading
                          ? "Escalating..."
                          : "Escalate Consultation"}
                      </button>
                    )}

                  {activeUser.role === "receiving_clinician" &&
                    consultation.status === "REQUESTED" && (
                      <button
                        type="button"
                        className="dashboard-action-button"
                        disabled={actionLoading}
                        onClick={() =>
                          handleAcceptConsultation(consultation.id)
                        }
                      >
                        {actionLoading ? "Accepting..." : "Accept Consultation"}
                      </button>
                    )}
                </div>

                {activeUser.role === "receiving_clinician" &&
                  consultation.status === "ACCEPTED" && (
                    <div className="consultation-actions">
                      <button
                        type="button"
                        className="dashboard-action-button"
                        disabled={actionLoading}
                        onClick={() => handleRecordOutcome(consultation.id)}
                      >
                        {actionLoading ? "Saving..." : "Record Outcome"}
                      </button>
                    </div>
                  )}

                {feedbackConsultationId === consultation.id &&
                  actionMessage && (
                    <p className="success-message">{actionMessage}</p>
                  )}

                {feedbackConsultationId === consultation.id && actionError && (
                  <p className="error-message">{actionError}</p>
                )}
              </article>
            ))
        )}
      </div>
    </div>
  );
}
