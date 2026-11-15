
import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "../../context/UserContext";
import { AlertCircle } from "lucide-react";
import { getReferrals } from "./referralsService";
import type {
  Referral,
  ReferralFilters as FilterValues,
  ReferralResponse,
} from "./referrals.types";
import "./referrals.css";
import ReferralDetails from "./components/ReferralDetails";
import ReferralStats from "./components/ReferralStats";
import ReferralFilters from "./components/ReferralFilters";
import ReferralTable from "./components/ReferralTable";

function ReferralsPage() {
  const { activeUser } = useUser();

  const [data, setData] = useState<ReferralResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReferral, setSelectedReferral] =
    useState<Referral | null>(null);

  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    priority: "all",
    status: "all",
    referringFacility: "all",
    receivingFacility: "all",
  });

  const isFacilityAdministrator =
    activeUser?.role === "facility_administrator";

  const loadReferrals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getReferrals();
      setData(response);

      setSelectedReferral((current) => {
        if (!current) return null;

        return (
          response.referrals.find((item) => item.id === current.id) ?? null
        );
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load referrals."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!activeUser) return;

    if (activeUser.role === "facility_administrator") {
      setData(null);
      setLoading(false);
      return;
    }

    void loadReferrals();
  }, [activeUser, loadReferrals]);

  async function handleReferralUpdated(_updatedReferral: Referral) {
    await loadReferrals();
  }

  const referrals = useMemo(
    () => data?.referrals ?? [],
    [data]
  );

  const referringFacilities = useMemo(
    () => [...new Set(referrals.map((item) => item.referringFacility))],
    [referrals]
  );

  const receivingFacilities = useMemo(
    () => [...new Set(referrals.map((item) => item.receivingFacility))],
    [referrals]
  );

  const filteredReferrals = useMemo(() => {
    return referrals.filter((item) => {
      const search = filters.search.toLowerCase().trim();

      const matchesSearch =
        !search ||
        item.id.toLowerCase().includes(search) ||
        item.caseId.toLowerCase().includes(search) ||
        item.patientLabel.toLowerCase().includes(search) ||
        item.screeningType.toLowerCase().includes(search) ||
        item.receivingFacility.toLowerCase().includes(search);

      const matchesPriority =
        filters.priority === "all" || item.priority === filters.priority;

      const matchesStatus =
        filters.status === "all" || item.status === filters.status;

      const matchesReferringFacility =
        filters.referringFacility === "all" ||
        item.referringFacility === filters.referringFacility;

      const matchesReceivingFacility =
        filters.receivingFacility === "all" ||
        item.receivingFacility === filters.receivingFacility;

      return (
        matchesSearch &&
        matchesPriority &&
        matchesStatus &&
        matchesReferringFacility &&
        matchesReceivingFacility
      );
    });
  }, [referrals, filters]);

  if (!activeUser || loading) {
    return (
      <div className="referrals-state">
        <div className="loading-spinner" />
        <p>Loading referrals...</p>
      </div>
    );
  }

  if (isFacilityAdministrator) {
    return (
      <div className="referrals-state">
        <h2>Referrals unavailable</h2>
        <p>
          Referral and clinical information is not available to facility
          administrators.
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="referrals-state referrals-error">
        <AlertCircle size={28} />
        <h2>Referrals unavailable</h2>
        <p>{error ?? "No referral data was returned."}</p>

        <button type="button" onClick={() => void loadReferrals()}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <main className="referrals-page">
      <div className="referrals-page-heading">
        <div>
          <span className="referrals-eyebrow">CARE COORDINATION</span>
          <h1>Referrals</h1>
          <p>
            Manage referral handovers, receiving-facility responses and
            follow-up outcomes.
          </p>
        </div>
      </div>

      <ReferralStats
        summary={{
          totalReferrals: referrals.length,
          pendingReferrals: referrals.filter(
            (item) => item.status === "pending"
          ).length,
          acceptedReferrals: referrals.filter(
            (item) => item.status === "accepted"
          ).length,
          rejectedReferrals: referrals.filter(
            (item) => item.status === "rejected"
          ).length,
          escalatedReferrals: referrals.filter(
            (item) => item.status === "escalated"
          ).length,
        }}
      />

      <ReferralFilters
        filters={filters}
        onChange={setFilters}
        referringFacilities={referringFacilities}
        receivingFacilities={receivingFacilities}
      />

      <ReferralTable
        referrals={filteredReferrals}
        onViewReferral={setSelectedReferral}
      />

      <ReferralDetails
        referral={selectedReferral}
        onClose={() => setSelectedReferral(null)}
        onReferralUpdated={handleReferralUpdated}
      />
    </main>
  );
}

export default ReferralsPage;
