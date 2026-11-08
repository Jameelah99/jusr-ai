
import { ArrowUpRight, CheckCircle2, Clock3, XCircle } from "lucide-react";
import type { ReferralOverview as ReferralData } from "../dashboard.types";
import { Link } from "react-router-dom";

interface ReferralOverviewProps {
  referrals: ReferralData;
}

function ReferralOverview({ referrals }: ReferralOverviewProps) {
  const total = referrals.total;

  const acceptedPercent =
    total > 0 ? (referrals.accepted / total) * 100 : 0;

  const pendingPercent =
    total > 0 ? (referrals.pending / total) * 100 : 0;

  const rejectedPercent =
    total > 0 ? (referrals.rejected / total) * 100 : 0;

  return (
    <section className="dashboard-panel referral-panel">
      <div className="panel-heading">
        <div>
          <h2>Referral overview</h2>
          <p>Referral status across facilities</p>
        </div>
      </div>

      <div className="referral-total">
        <h3>{total.toLocaleString()}</h3>
        <span>Total referrals</span>
      </div>

      <div
        className="referral-progress"
        role="img"
        aria-label={`${referrals.accepted} accepted, ${referrals.pending} pending and ${referrals.rejected} rejected referrals`}
      >
        <div
          className="referral-segment referral-accepted"
          style={{ width: `${acceptedPercent}%` }}
        />
        <div
          className="referral-segment referral-pending"
          style={{ width: `${pendingPercent}%` }}
        />
        <div
          className="referral-segment referral-rejected"
          style={{ width: `${rejectedPercent}%` }}
        />
      </div>

      <div className="referral-legend">
        <div className="referral-legend-item">
          <span className="referral-label">
            <CheckCircle2 size={15} />
            Accepted
          </span>
          <strong>{referrals.accepted}</strong>
        </div>

        <div className="referral-legend-item">
          <span className="referral-label">
            <Clock3 size={15} />
            Pending
          </span>
          <strong>{referrals.pending}</strong>
        </div>

        <div className="referral-legend-item">
          <span className="referral-label">
            <XCircle size={15} />
            Rejected
          </span>
          <strong>{referrals.rejected}</strong>
        </div>
      </div>

      <div className="referral-footer">
        <span>{Math.round(acceptedPercent)}% accepted</span>
        <Link to="/referrals">
          View referrals <ArrowUpRight size={14} />
        </Link>
      </div>
    </section>
  );
}

export default ReferralOverview;
