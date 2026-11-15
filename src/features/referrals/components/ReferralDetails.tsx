import { useEffect, useState } from "react";
import { X, Building2, UserRound, ClipboardList } from "lucide-react";
import type { Referral } from "../referrals.types";
import {
  acceptReferral,
  rejectReferral,
  escalateReferral,
} from "../referralsService";
import { useUser } from "../../../context/UserContext";

interface ReferralDetailsProps {
  referral: Referral | null;
  onClose: () => void;
  onReferralUpdated: (referral: Referral) => void;
}

function ReferralDetails({
  referral,
  onClose,
  onReferralUpdated,
}: ReferralDetailsProps) {
  const { activeUser } = useUser();

  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showEscalationForm, setShowEscalationForm] = useState(false);
  const [escalationReason, setEscalationReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    setShowRejectionForm(false);
    setRejectionReason("");
    setShowEscalationForm(false);
    setEscalationReason("");
    setIsSubmitting(false);
    setFeedback(null);
  }, [referral?.id]);

  if (!referral) return null;

  const isReceivingClinician = activeUser?.role === "receiving_clinician";

  const isReferringSide =
    activeUser?.role === "coordinator" ||
    activeUser?.role === "referring_clinician";

  const isPending = referral.status === "pending";

  const handleAccept = async () => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await acceptReferral(referral.id);
      onReferralUpdated(response.referral);
      setFeedback({
        type: "success",
        message: "Referral accepted successfully.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to accept referral.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    const reason = rejectionReason.trim();
    if (!reason) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await rejectReferral(referral.id, { reason });
      onReferralUpdated(response.referral);
      setShowRejectionForm(false);
      setRejectionReason("");
      setFeedback({
        type: "success",
        message: "Referral rejected successfully.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to reject referral.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalate = async () => {
    const reason = escalationReason.trim();
    if (!reason) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await escalateReferral(referral.id, { reason });
      onReferralUpdated(response.referral);
      setShowEscalationForm(false);
      setEscalationReason("");
      setFeedback({
        type: "success",
        message: "Referral escalated successfully.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to escalate referral.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="referral-drawer-overlay" onClick={onClose}>
      <aside
        className="referral-details-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="referral-drawer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="referral-drawer-header">
          <div>
            <span>REFERRAL DETAILS</span>
            <h2 id="referral-drawer-title">{referral.id}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close referral details"
          >
            <X size={20} />
          </button>
        </div>

        <div className="referral-drawer-content">
          <section className="referral-detail-section">
            <h3>
              <UserRound size={17} />
              Patient information
            </h3>

            <div className="referral-detail-field">
              <span>Patient</span>
              <strong>{referral.patientLabel}</strong>
            </div>

            <div className="referral-detail-field">
              <span>Linked case</span>
              <strong>{referral.caseId}</strong>
            </div>

            <div className="referral-detail-field">
              <span>Screening type</span>
              <strong>{referral.screeningType}</strong>
            </div>
          </section>

          <section className="referral-detail-section">
            <h3>
              <Building2 size={17} />
              Referral handover
            </h3>

            <div className="referral-detail-field">
              <span>Referring facility</span>
              <strong>{referral.referringFacility}</strong>
            </div>

            <div className="referral-detail-field">
              <span>Receiving facility</span>
              <strong>{referral.receivingFacility}</strong>
            </div>

            <div className="referral-detail-field">
              <span>Referring clinician</span>
              <strong>{referral.referringClinician}</strong>
            </div>

            <div className="referral-detail-field">
              <span>Receiving clinician</span>
              <strong>
                {referral.receivingClinician ?? "Awaiting assignment"}
              </strong>
            </div>
          </section>

          <section className="referral-detail-section">
            <h3>
              <ClipboardList size={17} />
              Clinical summary
            </h3>

            <div className="referral-detail-field">
              <span>Reason for referral</span>
              <p>{referral.referralReason}</p>
            </div>

            <div className="referral-detail-field">
              <span>Clinical information</span>
              <p>{referral.clinicalSummary}</p>
            </div>
          </section>

          <section className="referral-detail-section">
            <h3>Referral status</h3>

            <div className="referral-detail-field">
              <span>Current status</span>
              <strong>{referral.status.replace(/_/g, " ")}</strong>
            </div>

            {referral.rejectionReason && (
              <div className="referral-detail-field">
                <span>Rejection reason</span>
                <strong>{referral.rejectionReason}</strong>
              </div>
            )}

            {referral.escalationReason && (
              <div className="referral-detail-field">
                <span>Escalation reason</span>
                <strong>{referral.escalationReason}</strong>
              </div>
            )}

            {referral.outcome && (
              <div className="referral-detail-field">
                <span>Recorded outcome</span>
                <strong>{referral.outcome}</strong>
              </div>
            )}
          </section>

          {feedback && (
            <p
              className={
                feedback.type === "success"
                  ? "success-message"
                  : "error-message"
              }
              role="status"
            >
              {feedback.message}
            </p>
          )}

          {isPending && isReceivingClinician && (
            <section className="referral-detail-section">
              <h3>Receiving clinician decision</h3>

              {!showRejectionForm && (
                <div className="referral-decision-actions">
                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Accept referral"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRejectionForm(true)}
                    disabled={isSubmitting}
                  >
                    Reject referral
                  </button>
                </div>
              )}

              {showRejectionForm && (
                <div className="referral-rejection-form">
                  <label htmlFor="referral-rejection-reason">
                    Reason for rejection
                  </label>

                  <textarea
                    id="referral-rejection-reason"
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    placeholder="Explain why this referral cannot be accepted..."
                    disabled={isSubmitting}
                  />

                  <p>
                    Rejection requires a reason and must be recorded by an
                    authorised receiving clinician.
                  </p>

                  <div className="referral-decision-actions">
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={!rejectionReason.trim() || isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Confirm rejection"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowRejectionForm(false);
                        setRejectionReason("");
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {isPending && isReferringSide && (
            <section className="referral-detail-section">
              <h3>Referral escalation</h3>

              {!showEscalationForm && (
                <button
                  type="button"
                  onClick={() => setShowEscalationForm(true)}
                  disabled={isSubmitting || referral.status === "escalated"}
                >
                  Escalate referral
                </button>
              )}

              {showEscalationForm && (
                <div className="referral-rejection-form">
                  <label htmlFor="referral-escalation-reason">
                    Reason for escalation
                  </label>

                  <textarea
                    id="referral-escalation-reason"
                    value={escalationReason}
                    onChange={(event) =>
                      setEscalationReason(event.target.value)
                    }
                    placeholder="Explain why this referral needs escalation..."
                    disabled={isSubmitting}
                  />

                  <p>
                    Escalation requires a reason and must be recorded by an
                    authorised referring-side user.
                  </p>

                  <div className="referral-decision-actions">
                    <button
                      type="button"
                      onClick={handleEscalate}
                      disabled={!escalationReason.trim() || isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Confirm escalation"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowEscalationForm(false);
                        setEscalationReason("");
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        <div className="referral-drawer-footer">
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </aside>
    </div>
  );
}

export default ReferralDetails;
