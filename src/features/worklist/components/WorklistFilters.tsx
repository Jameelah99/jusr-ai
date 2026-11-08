
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { WorklistFilters as FilterValues } from "../worklist.types";

interface WorklistFiltersProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
  facilities: string[];
  coordinators: string[];
  statuses: string[];
}

function WorklistFilters({
  filters,
  onChange,
  facilities,
  coordinators,
  statuses,
}: WorklistFiltersProps) {
  function updateFilter<K extends keyof FilterValues>(
    key: K,
    value: FilterValues[K]
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
      facility: "all",
      assignedTo: "all",
    });
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.priority !== "all" ||
    filters.status !== "all" ||
    filters.facility !== "all" ||
    filters.assignedTo !== "all";

  return (
    <section className="worklist-filters">
      <div className="worklist-filter-heading">
        <div>
          <h2>
            <SlidersHorizontal size={17} />
            Filter cases
          </h2>
          <p>Find and narrow down cases in your worklist.</p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="clear-filters"
            onClick={clearFilters}
          >
            <X size={14} />
            Clear filters
          </button>
        )}
      </div>

      <div className="worklist-filter-controls">
        <div className="worklist-search">
          <Search size={17} />

          <input
            type="search"
            placeholder="Search case ID, patient or screening..."
            value={filters.search}
            onChange={(event) =>
              updateFilter("search", event.target.value)
            }
            aria-label="Search worklist"
          />
        </div>

        <select
          value={filters.priority}
          onChange={(event) =>
            updateFilter(
              "priority",
              event.target.value as FilterValues["priority"]
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
            updateFilter("status", event.target.value)
          }
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {statuses.map((status) => (
            <option value={status} key={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={filters.facility}
          onChange={(event) =>
            updateFilter("facility", event.target.value)
          }
          aria-label="Filter by facility"
        >
          <option value="all">All facilities</option>
          {facilities.map((facility) => (
            <option value={facility} key={facility}>
              {facility}
            </option>
          ))}
        </select>

        <select
          value={filters.assignedTo}
          onChange={(event) =>
            updateFilter("assignedTo", event.target.value)
          }
          aria-label="Filter by coordinator"
        >
          <option value="all">All coordinators</option>
          <option value="unassigned">Unassigned</option>
          {coordinators.map((coordinator) => (
            <option value={coordinator} key={coordinator}>
              {coordinator}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}

export default WorklistFilters;
