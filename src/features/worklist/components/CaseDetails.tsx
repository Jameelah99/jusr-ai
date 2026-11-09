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
import type { CaseTimelineEvent } from "../worklist.types";
import type { WorklistCase } from "../worklist.types";
import PriorityBadge from "./PriorityBadge";
import { formatDateTime } from "../../../utils/formatDateTime";

interface CaseDetailsProps {
  caseItem: WorklistCase | null;
  onClose: () => void;
  availableOwners: string[];
  onAssignOwner: (caseId: string, owner: string) => void;
  onRecordAssistedResponse: (caseItem: WorklistCase) => void;
  timelineEvents: CaseTimelineEvent[];
}

function CaseDetails({
  caseItem,
  onClose,
  availableOwners,
  onAssignOwner,
  onRecordAssistedResponse,
  timelineEvents,
}: CaseDetailsProps) {
  const [selectedOwner, setSelectedOwner] = useState("");

  useEffect(() => {
    setSelectedOwner(caseItem?.assignedTo ?? "");
  }, [caseItem?.id, caseItem?.assignedTo]);

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

          <section className="case-detail-section">
            <h3 className="case-section-title">
              <ClipboardList size={17} />
              Care coordination
            </h3>

            <div className="case-detail-field">
              <span>Current case owner</span>
              <strong>{caseItem.assignedTo ?? "Unassigned"}</strong>
            </div>

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

            <button
              type="button"
              className="case-assisted-response-button"
              onClick={() => onRecordAssistedResponse(caseItem)}
            >
              <PhoneCall size={17} />
              Record response on behalf of patient
            </button>

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
