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
import type { CaseTimelineEvent, ClosureType } from "../worklist.types";
import type { WorklistCase } from "../worklist.types";
import { useUser, type DemoUser } from "../../../context/UserContext";
import PriorityBadge from "./PriorityBadge";
import { formatDateTime } from "../../../utils/formatDateTime";
import { getEligiblePrimaryClinicians } from "../routing.service";
import { validateClosure } from "../closureValidation";
import { getClosureEvidenceChecklist } from "../demoState";

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
      )
    : { canClose: false, missing: [], message: undefined };

  useEffect(() => {
    setSelectedOwner(caseItem?.assignedTo ?? "");
  }, [caseItem?.id, caseItem?.assignedTo]);

  useEffect(() => {
    setSelectedClinician("");
  }, [caseItem?.id, caseItem?.specialty]);

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
                    {getEligiblePrimaryClinicians(caseItem).map((clinician) => (
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
                <strong>Supporting evidence</strong>

                {closureEvidence.length === 0 ? (
                  <p>
                    No supporting evidence records are available for this case.
                  </p>
                ) : (
                  <ul>
                    {closureEvidence.map((item) => (
                      <li key={item.id}>
                        <span>{item.label}</span>
                        <span>Available · Record: {item.sourceRecordId}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {closureValidation.missing.length > 0 && (
                <div role="alert" className="case-closure-validation">
                  <strong>Closure requirements not met:</strong>
                  <ul>
                    {closureValidation.missing.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {closureValidation.message && (
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
