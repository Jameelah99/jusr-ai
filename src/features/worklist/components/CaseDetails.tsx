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
import type { DemoUser } from "../../../context/UserContext";
import PriorityBadge from "./PriorityBadge";
import { formatDateTime } from "../../../utils/formatDateTime";
import {
  generatePatientLink,
  getPatientLinks,
  getPatientResponses,
  type GeneratedPatientLink,
  type PatientLinkRecord,
  type PatientResponseRecord,
} from "../../patient/patientAccessService";

import { validateClosure } from "../closureValidation";
import {
  getClosureEvidenceChecklist,
  getDemoContactAttempts,
  addDemoContactAttempt,
  getDemoCaseDelayRecords,
  addDemoCaseDelayRecord,
} from "../demoState";
import "./delay-followup.css";
import "../../ai/document-reader.css";
import { aiService } from "../../ai/ai.service";
import type { AIDocumentReadResult } from "../../ai/ai.types";
import MessageDrafter from "../../ai/MessageDrafter";

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
  // The authenticated backend session does not expose a staff directory.
  // Do not populate approver choices from demo-only users.
  const authorisedStaff: DemoUser[] = [];

  const [selectedOwner, setSelectedOwner] = useState("");

  const [patientLinks, setPatientLinks] = useState<PatientLinkRecord[]>([]);
  const [patientResponses, setPatientResponses] = useState<
    PatientResponseRecord[]
  >([]);
  const [generatedPatientLink, setGeneratedPatientLink] =
    useState<GeneratedPatientLink | null>(null);
  const [patientAccessLoading, setPatientAccessLoading] = useState(false);
  const [patientLinkGenerating, setPatientLinkGenerating] = useState(false);
  const [patientAccessError, setPatientAccessError] = useState("");

  const [documentText, setDocumentText] = useState("");
  const [documentReadResult, setDocumentReadResult] =
    useState<AIDocumentReadResult | null>(null);
  const [documentReadLoading, setDocumentReadLoading] = useState(false);
  const [documentReadError, setDocumentReadError] = useState("");

  const [patientLinkCopyStatus, setPatientLinkCopyStatus] = useState("");

  const canManagePatientAccess =
    activeUser.role === "coordinator" ||
    activeUser.role === "referring_clinician";

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

  useEffect(() => {
    if (!caseItem || !canManagePatientAccess) {
      setPatientLinks([]);
      setPatientResponses([]);
      setGeneratedPatientLink(null);
      setPatientAccessError("");
      return;
    }

    let cancelled = false;
    setPatientAccessLoading(true);
    setPatientAccessError("");
    setGeneratedPatientLink(null);

    Promise.all([
      getPatientLinks(caseItem.id),
      getPatientResponses(caseItem.id),
    ])
      .then(([links, responses]) => {
        if (cancelled) return;
        setPatientLinks(links);
        setPatientResponses(responses);
      })
      .catch((error) => {
        if (cancelled) return;
        setPatientAccessError(
          error instanceof Error
            ? error.message
            : "Unable to load patient access history.",
        );
      })
      .finally(() => {
        if (!cancelled) setPatientAccessLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [caseItem?.id, canManagePatientAccess]);

  async function handleReadDocument() {
    if (!caseItem || !documentText.trim()) return;

    setDocumentReadLoading(true);
    setDocumentReadError("");
    setDocumentReadResult(null);

    try {
      const result = await aiService.readDocument({
        caseId: caseItem.id,
        documentId: `manual-${caseItem.id}`,
        documentText: documentText.trim(),
      });

      setDocumentReadResult(result);
    } catch (error) {
      setDocumentReadError(
        error instanceof Error
          ? error.message
          : "Unable to read this document.",
      );
    } finally {
      setDocumentReadLoading(false);
    }
  }

  async function handleGeneratePatientLink() {
    if (!caseItem || isClosed || !canManagePatientAccess) return;

    const confirmed = window.confirm(
      "Generate a new secure patient link? Any previous active or locked link for this case will be superseded.",
    );
    if (!confirmed) return;

    setPatientLinkGenerating(true);
    setPatientAccessError("");
    setPatientLinkCopyStatus("");
    try {
      const generated = await generatePatientLink(caseItem.id);
      setGeneratedPatientLink(generated);
      const [links, responses] = await Promise.all([
        getPatientLinks(caseItem.id),
        getPatientResponses(caseItem.id),
      ]);
      setPatientLinks(links);
      setPatientResponses(responses);
    } catch (error) {
      setPatientAccessError(
        error instanceof Error
          ? error.message
          : "Unable to generate the patient link.",
      );
    } finally {
      setPatientLinkGenerating(false);
    }
  }

  async function handleCopyPatientLink() {
    if (!generatedPatientLink?.url) return;
    try {
      await navigator.clipboard.writeText(generatedPatientLink.url);
      setPatientLinkCopyStatus("Link copied.");
    } catch {
      setPatientLinkCopyStatus(
        "Copy was unavailable. Select and copy the link above.",
      );
    }
  }

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

          {activeUser.role === "coordinator" && !isClosed && (
            <section className="case-detail-section">
              <MessageDrafter
                caseId={caseItem.id}
                priority={caseItem.priority}
                disabled={isClosed}
              />
            </section>
          )}

          <section className="case-detail-section document-reader">
            <h3 className="case-section-title">Document reader</h3>

            <p className="document-reader-description">
              Paste a synthetic screening or laboratory report below. The system
              will extract available information for staff review.
            </p>

            <div className="document-reader-notice">
              Simulated extraction — staff review and verification required. No
              information will be added to the case automatically.
            </div>

            <div className="document-reader-input">
              <label htmlFor="document-reader-input">Document text</label>
              <textarea
                id="document-reader-input"
                value={documentText}
                onChange={(event) => setDocumentText(event.target.value)}
                placeholder="Paste synthetic document text here..."
              />
            </div>

            <button
              type="button"
              className="document-reader-button"
              onClick={handleReadDocument}
              disabled={documentReadLoading || !documentText.trim()}
            >
              {documentReadLoading ? "Reading document..." : "Read document"}
            </button>

            {documentReadError && (
              <p role="alert" className="document-reader-error">
                {documentReadError}
              </p>
            )}

            {documentReadResult && (
              <div className="document-reader-results">
                <h4>Extracted information</h4>

                <div className="document-reader-fields">
                  {Object.entries(documentReadResult.extractedFields).map(
                    ([field, value]) => (
                      <div className="document-reader-field" key={field}>
                        <span>{field.replace(/([A-Z])/g, " $1")}</span>
                        <strong>
                          {value == null ? "Not found" : String(value)}
                        </strong>
                      </div>
                    ),
                  )}
                </div>

                <div className="document-reader-candidates">
                  <h4>Patient match candidates</h4>

                  {documentReadResult.patientMatchCandidates.length === 0 ? (
                    <p>No patient match candidates found.</p>
                  ) : (
                    documentReadResult.patientMatchCandidates.map(
                      (candidate) => (
                        <div
                          className="document-reader-candidate"
                          key={candidate.patientId}
                        >
                          <strong>{candidate.displayName}</strong>
                          <p>{candidate.matchReason}</p>
                        </div>
                      ),
                    )
                  )}
                </div>

                <div className="document-reader-results-notices">
                  {documentReadResult.notices.map((notice, index) => (
                    <p key={index}>{notice}</p>
                  ))}
                </div>
              </div>
            )}
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
                          `Accept urgent case ${caseItem.id} assigned to you?`,
                        )
                      ) {
                        onAcceptUrgentCase(caseItem.id);
                      }
                    }}
                  >
                    Accept case
                  </button>
                )}

              {!isClosed &&
                (activeUser.role === "coordinator" ||
                  activeUser.role === "referring_clinician") && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Route urgent case ${caseItem.id} to an eligible ${caseItem.specialty} clinician?`,
                        )
                      ) {
                        onRouteUrgentCase(
                          caseItem.id,
                          caseItem.specialty ?? "",
                        );
                      }
                    }}
                  >
                    Route to eligible clinician
                  </button>
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

          {canManagePatientAccess && (
            <section className="case-detail-section">
              <h3 className="case-section-title">Patient access</h3>
              <p>
                Generate a secure link for the patient to review and respond. A
                new link supersedes any previous active or locked link.
              </p>

              {!isClosed && (
                <button
                  type="button"
                  onClick={handleGeneratePatientLink}
                  disabled={patientLinkGenerating}
                >
                  {patientLinkGenerating
                    ? "Generating secure link..."
                    : "Generate patient link"}
                </button>
              )}

              {generatedPatientLink && (
                <div className="case-detail-notice" role="status">
                  <strong>
                    {generatedPatientLink.resent
                      ? "Patient link resent"
                      : "Patient link generated"}
                  </strong>
                  <p>
                    This secure link is displayed once. Copy and share it
                    through your approved communication process.
                  </p>
                  <div className="case-detail-field">
                    <label htmlFor="generated-patient-link">
                      Secure patient link
                    </label>
                    <input
                      id="generated-patient-link"
                      type="text"
                      readOnly
                      value={generatedPatientLink.url}
                      onFocus={(event) => event.currentTarget.select()}
                    />
                  </div>
                  <button type="button" onClick={handleCopyPatientLink}>
                    Copy patient link
                  </button>
                  {patientLinkCopyStatus && (
                    <p role="status">{patientLinkCopyStatus}</p>
                  )}
                  <p>
                    Expires:{" "}
                    {new Date(generatedPatientLink.expiresAt).toLocaleString(
                      "en-GB",
                    )}
                  </p>
                  <p>
                    Identity verification{" "}
                    {generatedPatientLink.verificationRequired
                      ? "is required."
                      : "is not required for this patient."}
                  </p>
                  <small>{generatedPatientLink.note}</small>
                </div>
              )}

              {patientAccessError && (
                <p role="alert" className="case-closure-validation">
                  {patientAccessError}
                </p>
              )}

              <div>
                <strong>Patient link history</strong>
                {patientAccessLoading ? (
                  <p>Loading patient access history...</p>
                ) : patientLinks.length === 0 ? (
                  <p>No patient links have been generated for this case.</p>
                ) : (
                  <ul>
                    {patientLinks.map((link) => (
                      <li key={link.id}>
                        <strong>{link.status.replace(/_/g, " ")}</strong>
                        <p>
                          Created:{" "}
                          {new Date(link.createdAt).toLocaleString("en-GB")}
                        </p>
                        <p>
                          Expires:{" "}
                          {new Date(link.expiresAt).toLocaleString("en-GB")}
                        </p>
                        {link.verifiedAt && (
                          <p>
                            Verified:{" "}
                            {new Date(link.verifiedAt).toLocaleString("en-GB")}
                          </p>
                        )}
                        {link.lockedAt && (
                          <p>
                            Locked:{" "}
                            {new Date(link.lockedAt).toLocaleString("en-GB")}
                          </p>
                        )}
                        <small>
                          Failed verification attempts: {link.failedAttempts}
                        </small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <strong>Recorded patient responses</strong>
                {patientResponses.length === 0 ? (
                  <p>No patient responses recorded yet.</p>
                ) : (
                  <ul>
                    {patientResponses.map((response) => (
                      <li key={response.id}>
                        <strong>{response.kind.replace(/_/g, " ")}</strong>
                        <p>
                          Source:{" "}
                          {response.source === "STAFF_ASSISTED"
                            ? "Recorded by staff on behalf of patient"
                            : "Submitted by patient"}
                        </p>
                        <p>
                          Response:{" "}
                          {response.value
                            ? Object.entries(response.value)
                                .map(
                                  ([key, value]) => `${key}: ${String(value)}`,
                                )
                                .join(", ")
                            : "No response value"}
                        </p>
                        {response.note && <p>Note: {response.note}</p>}
                        <small>
                          Recorded:{" "}
                          {new Date(response.recordedAt).toLocaleString(
                            "en-GB",
                          )}
                          {response.recordedBy
                            ? ` · By ${response.recordedBy.displayName} (${response.recordedBy.role})`
                            : ""}
                        </small>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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

            {!isClosed && canManagePatientAccess && (
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
