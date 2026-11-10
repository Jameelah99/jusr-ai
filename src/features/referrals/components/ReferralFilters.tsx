
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { ReferralFilters as FilterValues } from "../referrals.types";

interface ReferralFiltersProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  referringFacilities: string[];
  receivingFacilities: string[];
}

function ReferralFilters({
  filters,
  onChange,
  referringFacilities,
  receivingFacilities,
}: ReferralFiltersProps) {
  function updateFilter<K extends keyof FilterValues>(
    key: K,
    value: FilterValues[K],
  ) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  function clearFilters() {
    onChange({
      search: "",
      priority: "all",
      status: "all",
      referringFacility: "all",
      receivingFacility: "all",
    });
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.priority !== "all" ||
    filters.status !== "all" ||
    filters.referringFacility !== "all" ||
    filters.receivingFacility !== "all";

  return (
    <section className="referral-filters">
      <div className="referral-filter-heading">
        <div>
          <h2>
            <SlidersHorizontal size={17} />
            Filter referrals
          </h2>
          <p>Search and narrow down referral records.</p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="referral-clear-filters"
            onClick={clearFilters}
          >
            <X size={14} />
            Clear filters
          </button>
        )}
      </div>

      <div className="referral-filter-controls">
        <div className="referral-search">
          <Search size={17} />
          <input
            type="search"
            placeholder="Search referral, case, patient or facility..."
            value={filters.search}
            onChange={(event) =>
              updateFilter("search", event.target.value)
            }
            aria-label="Search referrals"
          />
        </div>

        <select
          value={filters.priority}
          onChange={(event) =>
            updateFilter(
              "priority",
              event.target.value as FilterValues["priority"],
            )
          }
          aria-label="Filter by priority"
        >
          <option value="all">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
        </select>

        <select
          value={filters.status}
          onChange={(event) =>
            updateFilter(
              "status",
              event.target.value as FilterValues["status"],
            )
          }
          aria-label="Filter by referral status"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="escalated">Escalated</option>
          <option value="outcome_recorded">Outcome recorded</option>
        </select>

        <select
          value={filters.referringFacility}
          onChange={(event) =>
            updateFilter("referringFacility", event.target.value)
          }
          aria-label="Filter by referring facility"
        >
          <option value="all">All referring facilities</option>
          {referringFacilities.map((facility) => (
            <option value={facility} key={facility}>
              {facility}
            </option>
          ))}
        </select>

        <select
          value={filters.receivingFacility}
          onChange={(event) =>
            updateFilter("receivingFacility", event.target.value)
          }
          aria-label="Filter by receiving facility"
        >
          <option value="all">All receiving facilities</option>
          {receivingFacilities.map((facility) => (
            <option value={facility} key={facility}>
              {facility}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}

export default ReferralFilters;
