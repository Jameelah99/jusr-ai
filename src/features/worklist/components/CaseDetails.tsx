import { useEffect, useRef, useState } from "react";
import {
  X,
  UserRound,
  Building2,
  ClipboardList,
  Activity,
  Clock3,
  PhoneCall,
} from "lucide-react";
import CaseTimeline from "./CaseTimeline";
import type {
  CaseTimelineEvent,
  ClosureType,
  ContactAttemptRecord,
  ContactAttemptRoute,
  ContactAttemptOutcome,
  CaseDelayRecord,
  DelayReasonCode,
} from "../worklist.types";
import type { WorklistCase } from "../worklist.types";
import { useUser, type DemoUser } from "../../../context/UserContext";
import PriorityBadge from "./PriorityBadge";
import { formatDateTime } from "../../../utils/formatDateTime";
import { getEligiblePrimaryClinicians } from "../routing.service";
import { validateClosure } from "../closureValidation";
import {
  getClosureEvidenceChecklist,
  getDemoContactAttempts,
  addDemoContactAttempt,
  getDemoCaseDelayRecords,
  addDemoCaseDelayRecord,
} from "../demoState";
import "./delay-followup.css";

interface CaseDetailsProps {
  caseItem: WorklistCase | null;
  activeUser: DemoUser;
  onClose: () => void;
  availableOwners: string[];
  onRouteUrgentCase: (caseId: string, clinician: string) => void;
  onAcceptUrgentCase: (caseId: string) => void;
  onAssignOwner: (caseId: string, owner: string) => void;
  onRecordAssistedResponse: (caseItem: WorklistCase) => void;
  timelineEvents: CaseTimelineEvent[];
  onCloseCase: (
    caseId: string,
    closureType: ClosureType,
    reason: string,
    evidence: import("../worklist.types").ClosureEvidenceItem[],
    secondApproverId?: string,
  ) => void;
}

function CaseDetails({
  caseItem,
  activeUser,
  onClose,
  onCloseCase,
  availableOwners,
  onRouteUrgentCase,
  onAcceptUrgentCase,
  onAssignOwner,
  onRecordAssistedResponse,
  timelineEvents,
}: CaseDetailsProps) {
  const { demoUsers } = useUser();

  const authorisedStaff = demoUsers.filter((user) => user.authorisedToClose);

  const [selectedOwner, setSelectedOwner] = useState("");

  const [selectedClinician, setSelectedClinician] = useState("");

  const canCloseCase = activeUser.authorisedToClose;

  const isClosed = Boolean(caseItem?.closure || caseItem?.status === "Closed");

  const [closureType, setClosureType] = useState<ClosureType>("care_confirmed");

  const [closureReason, setClosureReason] = useState("");

  const [secondApproverId, setSecondApproverId] = useState("");

  const [contactAttempts, setContactAttempts] = useState<
    ContactAttemptRecord[]
  >([]);
  const [contactRoute, setContactRoute] =
    useState<ContactAttemptRoute>("phone");
  const [contactOutcome, setContactOutcome] =
    useState<ContactAttemptOutcome>("no_answer");
  const [contactAttemptedAt, setContactAttemptedAt] = useState("");
  const [contactNotes, setContactNotes] = useState("");
  const [contactAttemptError, setContactAttemptError] = useState("");

  const [delayRecords, setDelayRecords] = useState<CaseDelayRecord[]>([]);
  const [delayReasonCode, setDelayReasonCode] = useState<DelayReasonCode>(
    "patient_unreachable",
  );
  const [delayExplanation, setDelayExplanation] = useState("");
  const [delayFollowupError, setDelayFollowupError] = useState("");

  const closureEvidence = caseItem
    ? getClosureEvidenceChecklist(caseItem.id)
    : [];

  const closureValidation = caseItem
    ? validateClosure(
        caseItem,
        closureType,
        closureReason,
        closureEvidence,
        authorisedStaff.find((user) => user.id === secondApproverId)?.name,
        {
          contactAttempts,
        },
      )
    : {
        canClose: false,
        missing: [],
        checklist: [],
        message: undefined,
      };

  useEffect(() => {
    setSelectedOwner(caseItem?.assignedTo ?? "");
  }, [caseItem?.id, caseItem?.assignedTo]);

  useEffect(() => {
    setSelectedClinician("");
  }, [caseItem?.id, caseItem?.specialty]);

  useEffect(() => {
    if (!caseItem) {
      setContactAttempts([]);
      return;
    }

    setContactAttempts(getDemoContactAttempts(caseItem.id));
    setContactAttemptError("");
  }, [caseItem?.id]);

  useEffect(() => {
    if (!caseItem) {
      setDelayRecords([]);
      setDelayFollowupError("");
      return;
    }

    setDelayRecords(getDemoCaseDelayRecords(caseItem.id));
    setDelayReasonCode("patient_unreachable");
    setDelayExplanation("");
    setDelayFollowupError("");
  }, [caseItem?.id]);

  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!caseItem) return;

    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements =
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );

      if (!focusableElements?.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [caseItem]);

  function handleRecordContactAttempt() {
    if (!caseItem || isClosed) return;

    if (!contactAttemptedAt) {
      setContactAttemptError("Select when the contact attempt occurred.");
      return;
    }

    const attempt: ContactAttemptRecord = {
      id: `ATT-${Date.now()}`,
      caseId: caseItem.id,
      route: contactRoute,
      attemptedAt: new Date(contactAttemptedAt).toISOString(),
      outcome: contactOutcome,
      notes: contactNotes.trim(),
      recordedBy: activeUser.name,
      recordedByStaffId: activeUser.id,
      recordedByRole: activeUser.role,
      recordedAt: new Date().toISOString(),
    };

    try {
      addDemoContactAttempt(attempt);
      setContactAttempts(getDemoContactAttempts(caseItem.id));
      setContactAttemptedAt("");
      setContactNotes("");
      setContactOutcome("no_answer");
      setContactAttemptError("");
    } catch (error) {
      setContactAttemptError(
        error instanceof Error
          ? error.message
          : "Unable to record contact attempt.",
      );
    }
  }

  function handleRecordDelayFollowup() {
    if (!caseItem || isClosed) return;

    if (!caseItem.flags?.includes("OVERDUE")) {
      setDelayFollowupError(
        "A reason for delay can only be recorded for an overdue case.",
      );
      return;
    }

    if (delayReasonCode === "other" && !delayExplanation.trim()) {
      setDelayFollowupError("Please explain the reason for selecting Other.");
      return;
    }

    const record: CaseDelayRecord = {
      id: `DELAY-${Date.now()}`,
      caseId: caseItem.id,
      flag: "OVERDUE",
      reasonCode: delayReasonCode,
      explanation: delayExplanation.trim() || undefined,
      recordedBy: activeUser.name,
      recordedByStaffId: activeUser.id,
      recordedByRole: activeUser.role,
      recordedAt: new Date().toISOString(),
    };

    try {
      addDemoCaseDelayRecord(record);
      setDelayRecords(getDemoCaseDelayRecords(caseItem.id));
      setDelayExplanation("");
      setDelayReasonCode("patient_unreachable");
      setDelayFollowupError("");
    } catch (error) {
      setDelayFollowupError(
        error instanceof Error
          ? error.message
          : "Unable to record the reason for delay.",
      );
    }
  }

  if (!caseItem) return null;

  const formattedDate = caseItem.dueDate
    ? new Date(`${caseItem.dueDate}T00:00:00`).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Not set";

  return (
    <div className="case-drawer-overlay" onClick={onClose}>
      <aside
        ref={drawerRef}
        className="case-details-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-drawer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="case-drawer-header">
          <div>
            <span className="case-drawer-eyebrow">CASE DETAILS</span>
            <h2 id="case-drawer-title">{caseItem.id}</h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="case-drawer-close"
            onClick={onClose}
            aria-label="Close case details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="case-drawer-content">
          <section className="case-detail-section">
            <div className="case-patient-heading">
              <div className="case-patient-avatar">
                <UserRound size={23} />
              </div>

              <div>
                <h3>{caseItem.patientLabel}</h3>
                <p>
                  {caseItem.age} years · {caseItem.sex}
                </p>
              </div>
            </div>

            <div className="case-status-row">
              <PriorityBadge priority={caseItem.priority} />
              <span className="worklist-status">{caseItem.status}</span>
            </div>

            {isClosed && (
              <div className="case-detail-notice" role="status">
                This case is closed and is now read-only. No further case
                actions or workflow changes are permitted.
              </div>
            )}
          </section>

          <section className="case-detail-section">
            <h3 className="case-section-title">
              <Activity size={17} />
              Screening information
            </h3>

            <div className="case-detail-field">
              <span>Screening type</span>
              <strong>{caseItem.screeningType}</strong>
            </div>

            <div className="case-detail-field">
              <span>Screening result</span>
              <strong>{caseItem.screeningResult}</strong>
            </div>
          </section>

          {caseItem.flags?.includes("OVERDUE") && !isClosed && (
            <section className="case-detail-section case-delay-followup">
              <h3 className="case-section-title">Reason for delay</h3>

              <p>
                This case is overdue. Record the reason for the delay before
                proceeding with its follow-up.
              </p>

              <div className="case-detail-field">
                <label htmlFor="delay-reason-code">Reason for delay</label>
                <select
                  id="delay-reason-code"
                  value={delayReasonCode}
                  onChange={(event) =>
                    setDelayReasonCode(event.target.value as DelayReasonCode)
                  }
                >
                  <option value="patient_unreachable">
                    Patient unreachable
                  </option>
                  <option value="patient_did_not_understand">
                    Patient did not understand
                  </option>
                  <option value="referral_declined">Referral declined</option>
                  <option value="no_slot_available">No slot available</option>
                  <option value="result_or_data_missing">
                    Result or data missing
                  </option>
                  <option value="patient_moved">Patient moved</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {delayReasonCode === "other" && (
                <div className="case-detail-field">
                  <label htmlFor="delay-explanation">
                    Explanation (required)
                  </label>
                  <textarea
                    id="delay-explanation"
                    rows={3}
                    value={delayExplanation}
                    onChange={(event) =>
                      setDelayExplanation(event.target.value)
                    }
                    placeholder="Explain the reason for the delay..."
                  />
                </div>
              )}

              {delayFollowupError && (
                <p role="alert" className="case-closure-validation">
                  {delayFollowupError}
                </p>
              )}

              <button
                type="button"
                onClick={handleRecordDelayFollowup}
                disabled={
                  delayReasonCode === "other" && !delayExplanation.trim()
                }
              >
                Record delay follow-up
              </button>

              <div>
                <strong>
                  Recorded delay follow-ups ({delayRecords.length})
                </strong>

                {delayRecords.length === 0 ? (
                  <p>No delay follow-ups recorded yet.</p>
                ) : (
                  <ul>
                    {delayRecords.map((record) => (
                      <li key={record.id}>
                        <strong>{record.reasonCode.replace(/_/g, " ")}</strong>
                        {record.explanation && <p>{record.explanation}</p>}
                        <small>
                          Recorded by {record.recordedBy} (
                          {record.recordedByRole}){" — "}
                          {new Date(record.recordedAt).toLocaleString("en-GB")}
                        </small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}

          {caseItem.priority === "urgent" && caseItem.specialty && (
            <section className="case-routing-panel">
              <h3 className="case-section-title">Clinical specialty routing</h3>

              <p>
                Required specialty: <strong>{caseItem.specialty}</strong>
              </p>

              <p>
                Routing status: <strong>{caseItem.routingStatus}</strong>
              </p>

              {!isClosed &&
                caseItem.routingStatus === "awaiting_acceptance" &&
                caseItem.assignedTo === activeUser.name &&
                activeUser.role === "receiving_clinician" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Accept urgent case ${caseItem.id} assigned to ${caseItem.assignedTo}?`,
                        )
                      ) {
                        onAcceptUrgentCase(caseItem.id);
                      }
                    }}
                  >
                    Accept case
                  </button>
                )}

              {!isClosed && (
                <>
                  <label htmlFor="clinical-routing-select">
                    Select eligible clinician
                  </label>

                  <select
                    id="clinical-routing-select"
                    value={selectedClinician}
                    onChange={(event) =>
                      setSelectedClinician(event.target.value)
                    }
                  >
                    <option value="">Select a clinician</option>
                    {getEligiblePrimaryClinicians(caseItem, demoUsers).map((clinician) => (
                      <option key={clinician} value={clinician}>
                        {clinician}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={!selectedClinician}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Route ${caseItem.id} to ${selectedClinician} for clinical acceptance?`,
                        )
                      ) {
                        onRouteUrgentCase(caseItem.id, selectedClinician);
                        setSelectedClinician("");
                      }
                    }}
                  >
                    Route to clinician
                  </button>
                </>
              )}
            </section>
          )}

          {canCloseCase && !caseItem.closure && (
            <section className="case-detail-section">
              <h3 className="case-section-title">Case closure</h3>

              <div className="case-detail-field">
                <label htmlFor="closure-type">Closure type</label>
                <select
                  id="closure-type"
                  value={closureType}
                  onChange={(event) => {
                    setClosureType(event.target.value as ClosureType);
                    setSecondApproverId("");
                  }}
                >
                  <option value="care_confirmed">Care confirmed</option>
                  <option value="not_actionable">Not actionable</option>
                  <option value="no_further_care_needed">
                    No further care needed
                  </option>
                  <option value="patient_declined">Patient declined</option>
                  <option value="unreachable">Unreachable</option>
                  <option value="moved_or_transferred">
                    Moved or transferred
                  </option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="case-detail-field">
                <label htmlFor="closure-reason">Closure reason</label>
                <textarea
                  id="closure-reason"
                  value={closureReason}
                  onChange={(event) => setClosureReason(event.target.value)}
                  placeholder="Record the clinical decision and reason for closure..."
                  rows={4}
                />
              </div>

              {closureType === "unreachable" && (
                <div className="case-closure-evidence">
                  <strong>Contact attempt log</strong>

                  <p>
                    Record each phone or message attempt separately. These
                    records do not replace the required clinician decision.
                  </p>

                  <div className="case-detail-field">
                    <label htmlFor="contact-route">Contact route</label>
                    <select
                      id="contact-route"
                      value={contactRoute}
                      onChange={(event) =>
                        setContactRoute(
                          event.target.value as ContactAttemptRoute,
                        )
                      }
                    >
                      <option value="phone">Phone</option>
                      <option value="message">Message</option>
                    </select>
                  </div>

                  <div className="case-detail-field">
                    <label htmlFor="contact-attempted-at">
                      Date and time attempted
                    </label>
                    <input
                      id="contact-attempted-at"
                      type="datetime-local"
                      value={contactAttemptedAt}
                      onChange={(event) =>
                        setContactAttemptedAt(event.target.value)
                      }
                    />
                  </div>

                  <div className="case-detail-field">
                    <label htmlFor="contact-outcome">Outcome</label>
                    <select
                      id="contact-outcome"
                      value={contactOutcome}
                      onChange={(event) =>
                        setContactOutcome(
                          event.target.value as ContactAttemptOutcome,
                        )
                      }
                    >
                      <option value="no_answer">No answer</option>
                      <option value="no_response">No response</option>
                      <option value="reached_patient">Reached patient</option>
                      <option value="failed">Attempt failed</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="case-detail-field">
                    <label htmlFor="contact-notes">Notes</label>
                    <textarea
                      id="contact-notes"
                      rows={2}
                      value={contactNotes}
                      onChange={(event) => setContactNotes(event.target.value)}
                      placeholder="Add details about the attempt..."
                    />
                  </div>

                  {contactAttemptError && (
                    <p role="alert" className="case-closure-validation">
                      {contactAttemptError}
                    </p>
                  )}

                  <button
                    type="button"
                    disabled={!contactAttemptedAt}
                    onClick={handleRecordContactAttempt}
                  >
                    Record contact attempt
                  </button>

                  <div>
                    <strong>
                      Recorded attempts ({contactAttempts.length})
                    </strong>

                    {contactAttempts.length === 0 ? (
                      <p>No contact attempts recorded yet.</p>
                    ) : (
                      <ul>
                        {contactAttempts.map((attempt) => (
                          <li key={attempt.id}>
                            <strong>
                              {attempt.route === "phone" ? "Phone" : "Message"}
                            </strong>
                            {" — "}
                            {attempt.outcome.replace(/_/g, " ")}
                            <p>
                              {new Date(attempt.attemptedAt).toLocaleString(
                                "en-GB",
                              )}
                            </p>
                            {attempt.notes && <p>{attempt.notes}</p>}
                            <small>
                              Recorded by {attempt.recordedBy} (
                              {attempt.recordedByRole})
                            </small>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {closureType === "other" && (
                <div className="case-detail-field">
                  <label htmlFor="closure-second-approver">
                    Second authorised approver
                  </label>

                  <select
                    id="closure-second-approver"
                    value={secondApproverId}
                    onChange={(event) =>
                      setSecondApproverId(event.target.value)
                    }
                  >
                    <option value="">Select an authorised staff member</option>

                    {authorisedStaff
                      .filter((user) => user.id !== activeUser.id)
                      .map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="case-closure-evidence">
                <strong>Evidence checklist</strong>

                {closureValidation.checklist.length === 0 ? (
                  <p>
                    No supporting evidence is required for this closure type.
                  </p>
                ) : (
                  <ul>
                    {closureValidation.checklist.map((item) => (
                      <li key={item.label}>
                        <div>
                          <strong>{item.label}</strong>
                          {item.satisfied && item.supportingRecord && (
                            <p>
                              Record: {item.supportingRecord.sourceRecordId}
                              {item.supportingRecord.sourceDescription
                                ? ` — ${item.supportingRecord.sourceDescription}`
                                : ""}
                            </p>
                          )}
                        </div>

                        <span
                          className={
                            item.satisfied
                              ? "closure-evidence-available"
                              : "closure-evidence-missing"
                          }
                        >
                          {item.satisfied ? "Available" : "Missing"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {(() => {
                const evidenceLabels = closureValidation.checklist.map(
                  (item) => item.label,
                );

                const otherMissing = closureValidation.missing.filter(
                  (item) => !evidenceLabels.includes(item),
                );

                return otherMissing.length > 0 ? (
                  <div role="alert" className="case-closure-validation">
                    <strong>Other closure requirements not met:</strong>
                    <ul>
                      {otherMissing.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              })()}

              {closureValidation.message &&
                closureValidation.missing.length === 0 && (
                  <p role="alert" className="case-closure-validation">
                    {closureValidation.message}
                  </p>
                )}
            </section>
          )}

          <section className="case-detail-section">
            <h3 className="case-section-title">
              <ClipboardList size={17} />
              Care coordination
            </h3>

            <div className="case-detail-field">
              <span>Current case owner</span>
              <strong>{caseItem.assignedTo ?? "Unassigned"}</strong>
            </div>

            {!isClosed && (
              <div className="case-owner-assignment">
                <label htmlFor="case-owner-select">
                  {caseItem.assignedTo
                    ? "Change case owner"
                    : "Assign case owner"}
                </label>

                <select
                  id="case-owner-select"
                  value={selectedOwner}
                  onChange={(event) => setSelectedOwner(event.target.value)}
                >
                  <option value="">Select a staff member</option>

                  {availableOwners.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="case-owner-confirm"
                  disabled={
                    !selectedOwner || selectedOwner === caseItem.assignedTo
                  }
                  onClick={() => {
                    if (
                      window.confirm(
                        `Assign ${selectedOwner} as the owner of ${caseItem.id}?`,
                      )
                    ) {
                      onAssignOwner(caseItem.id, selectedOwner);
                    }
                  }}
                >
                  Confirm assignment
                </button>
              </div>
            )}

            {!isClosed && (
              <button
                type="button"
                className="case-assisted-response-button"
                onClick={() => onRecordAssistedResponse(caseItem)}
              >
                <PhoneCall size={17} />
                Record response on behalf of patient
              </button>
            )}

            <div className="case-detail-field">
              <span>Next required action</span>
              <strong>{caseItem.nextAction}</strong>
            </div>

            <div className="case-detail-field">
              <span>Due date</span>
              <strong>{formattedDate}</strong>
            </div>
          </section>

          <section className="case-detail-section">
            <h3 className="case-section-title">
              <Building2 size={17} />
              Facility information
            </h3>

            <div className="case-detail-field">
              <span>Facility</span>
              <strong>{caseItem.facility}</strong>
            </div>

            <div className="case-detail-field">
              <span>Last updated</span>
              <strong>{formatDateTime(caseItem.lastUpdated)}</strong>
            </div>
          </section>

          <CaseTimeline events={timelineEvents} />

          <section className="case-detail-notice">
            <Clock3 size={17} />
            <p>
              Case actions and workflow transitions will be connected to backend
              validation and audit logging.
            </p>
          </section>
        </div>

        <div className="case-drawer-footer">
          {canCloseCase && !caseItem.closure && (
            <button
              type="button"
              className="case-close-button"
              disabled={!closureValidation.canClose}
              title={
                !closureValidation.canClose
                  ? "Complete all closure requirements before closing this case."
                  : "Close case"
              }
              onClick={() => {
                if (!caseItem || !closureValidation.canClose) return;

                const confirmed = window.confirm(
                  `Are you sure you want to close ${caseItem.id} as "${closureType}"? This action will be recorded in the audit timeline.`,
                );

                if (!confirmed) return;

                onCloseCase(
                  caseItem.id,
                  closureType,
                  closureReason,
                  closureEvidence,
                  secondApproverId || undefined,
                );
              }}
            >
              Close Case
            </button>
          )}

          <button
            type="button"
            className="case-drawer-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
}

export default CaseDetails;
