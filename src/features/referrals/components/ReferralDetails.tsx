
import { useEffect, useState } from "react";
import { X, Building2, UserRound, ClipboardList } from "lucide-react";
import type { Referral } from "../referrals.types";

interface ReferralDetailsProps {
  referral: Referral | null;
  onClose: () => void;
}

function ReferralDetails({
  referral,
  onClose,
}: ReferralDetailsProps) {
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    setShowRejectionForm(false);
    setRejectionReason("");
  }, [referral?.id]);

  if (!referral) return null;

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

            {referral.outcome && (
              <div className="referral-detail-field">
                <span>Recorded outcome</span>
                <strong>{referral.outcome}</strong>
              </div>
            )}
          </section>

          {referral.status === "pending" && (
            <section className="referral-detail-section">
              <h3>Receiving clinician decision</h3>

              {!showRejectionForm ? (
                <button
                  type="button"
                  onClick={() => setShowRejectionForm(true)}
                >
                  Reject referral
                </button>
              ) : (
                <div className="referral-rejection-form">
                  <label htmlFor="referral-rejection-reason">
                    Reason for rejection
                  </label>

                  <textarea
                    id="referral-rejection-reason"
                    value={rejectionReason}
                    onChange={(event) =>
                      setRejectionReason(event.target.value)
                    }
                    placeholder="Explain why this referral cannot be accepted..."
                  />

                  <p>
                    Rejection requires a reason and must be recorded by an
                    authorised receiving clinician.
                  </p>

                  <button
                    type="button"
                    disabled={!rejectionReason.trim()}
                  >
                    Confirm rejection
                  </button>
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
