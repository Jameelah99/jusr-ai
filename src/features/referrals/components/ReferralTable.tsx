import { Eye, ArrowUpRight } from "lucide-react";
import type { Referral } from "../referrals.types";

interface ReferralTableProps {
  referrals: Referral[];
  onViewReferral: (referral: Referral) => void;
}

function ReferralTable({
  referrals,
  onViewReferral,
}: ReferralTableProps) {
  if (!referrals.length) {
    return (
      <div className="referral-empty">
        <p>No referrals found.</p>
        <span>Try adjusting your search or filters.</span>
      </div>
    );
  }

  return (
    <div className="referral-table-wrapper">
      <table className="referral-table">
        <thead>
          <tr>
            <th>Referral</th>
            <th>Patient / Case</th>
            <th>Priority</th>
            <th>Receiving facility</th>
            <th>Receiving clinician</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {referrals.map((referral) => (
            <tr key={referral.id}>
              <td>
                <strong>{referral.id}</strong>
                <span className="referral-muted">
                  {referral.screeningType}
                </span>
              </td>

              <td>
                <strong>{referral.patientLabel}</strong>
                <span className="referral-muted">
                  {referral.caseId}
                </span>
              </td>

              <td>
                <span
                  className={`referral-priority referral-priority-${referral.priority}`}
                >
                  {referral.priority}
                </span>
              </td>

              <td>{referral.receivingFacility}</td>

              <td>
                {referral.receivingClinician ?? "Awaiting assignment"}
              </td>

              <td>
                <span
                  className={`referral-status referral-status-${referral.status}`}
                >
                  {referral.status.replace(/_/g, " ")}
                </span>
              </td>

              <td>
                <button
                  type="button"
                  className="referral-view-button"
                  onClick={() => onViewReferral(referral)}
                >
                  <Eye size={15} />
                  View
                  <ArrowUpRight size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReferralTable;