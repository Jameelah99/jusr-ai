import { Eye, ArrowUpRight } from "lucide-react";
import { useUser } from "../../../context/UserContext";
import type { Referral } from "../referrals.types";

interface ReferralTableProps {
  referrals: Referral[];
  onViewReferral: (referral: Referral) => void;
}

function ReferralTable({ referrals, onViewReferral }: ReferralTableProps) {
  const { activeUser } = useUser();

  const isIncomingView =
    activeUser.role === "receiving_clinician" ||
    (activeUser.role === "coordinator" &&
      activeUser.facility.name === "Central Specialist Hospital");

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
            <th>
              {isIncomingView ? "Referring facility" : "Receiving facility"}
            </th>
            <th>
              {isIncomingView ? "Referring clinician" : "Receiving clinician"}
            </th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {referrals.map((referral) => (
            <tr key={referral.id}>
              <td>
                <strong>{referral.id}</strong>
                <span className="referral-muted">{referral.screeningType}</span>
              </td>

              <td>
                <strong>{referral.patientLabel}</strong>
                <span className="referral-muted">{referral.caseId}</span>
              </td>

              <td>
                <span
                  className={`referral-priority referral-priority-${referral.priority}`}
                >
                  {referral.priority}
                </span>
              </td>

              <td>
                {isIncomingView
                  ? referral.referringFacility
                  : referral.receivingFacility}
              </td>

              <td>
                {isIncomingView
                  ? referral.referringClinician
                  : (referral.receivingClinician ?? "Awaiting assignment")}
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
