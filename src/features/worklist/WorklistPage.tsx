import "./worklist.css";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WorklistStats from "./components/WorklistStats";
import WorklistFilters from "./components/WorklistFilters";
import WorklistTable from "./components/WorklistTable";
import CaseDetails from "./components/CaseDetails";
import { getWorklist } from "../../services/api/worklistService";
import type {
  WorklistFilters as FilterValues,
  WorklistResponse,
} from "./worklist.types";

function WorklistPage() {
  const [worklist, setWorklist] = useState<WorklistResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    priority: "all",
    status: "all",
    facility: "all",
    assignedTo: "all",
  });

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  async function loadWorklist() {
    try {
      setLoading(true);
      setError(null);

      const data = await getWorklist();
      setWorklist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load worklist.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorklist();
  }, []);

  const cases = worklist?.cases ?? [];

  const selectedCase = cases.find((item) => item.id === selectedCaseId) ?? null;

  const availableOwners = ["Dr. Williams", "Nurse Johnson", "Dr. Adams"];

  const facilities = useMemo(
    () => [...new Set(cases.map((item) => item.facility))],
    [cases],
  );

  const coordinators = useMemo(
    () => [
      ...new Set(
        cases
          .map((item) => item.assignedTo)
          .filter((name): name is string => name !== null),
      ),
    ],
    [cases],
  );

  const statuses = useMemo(
    () => [...new Set(cases.map((item) => item.status))],
    [cases],
  );

  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      const search = filters.search.toLowerCase().trim();

      const matchesSearch =
        !search ||
        item.id.toLowerCase().includes(search) ||
        item.patientLabel.toLowerCase().includes(search) ||
        item.screeningType.toLowerCase().includes(search) ||
        item.screeningResult.toLowerCase().includes(search);

      const matchesPriority =
        filters.priority === "all" || item.priority === filters.priority;

      const matchesStatus =
        filters.status === "all" || item.status === filters.status;

      const matchesFacility =
        filters.facility === "all" || item.facility === filters.facility;

      const matchesCoordinator =
        filters.assignedTo === "all" ||
        (filters.assignedTo === "unassigned"
          ? item.assignedTo === null
          : item.assignedTo === filters.assignedTo);

      return (
        matchesSearch &&
        matchesPriority &&
        matchesStatus &&
        matchesFacility &&
        matchesCoordinator
      );
    });
  }, [cases, filters]);

  if (loading) {
    return (
      <div className="worklist-state">
        <div className="loading-spinner" />
        <p>Loading worklist...</p>
      </div>
    );
  }

  if (error || !worklist) {
    return (
      <div className="worklist-state worklist-error">
        <AlertCircle size={28} />
        <h2>Worklist unavailable</h2>
        <p>{error ?? "No worklist data was returned."}</p>

        <button type="button" onClick={loadWorklist}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <main className="worklist-page">
      <div className="worklist-page-heading">
        <div>
          <span className="worklist-eyebrow">CASE MANAGEMENT</span>

          <h1>Worklist</h1>

          <p>
            Monitor, prioritise and coordinate cases requiring follow-up across
            your facilities.
          </p>
        </div>
      </div>

      <WorklistStats summary={worklist.summary} />

      <WorklistFilters
        filters={filters}
        onChange={setFilters}
        facilities={facilities}
        coordinators={coordinators}
        statuses={statuses}
      />

      <WorklistTable
        cases={filteredCases}
        onSelectCase={(item) => setSelectedCaseId(item.id)}
      />

      <CaseDetails
        caseItem={selectedCase}
        onClose={() => setSelectedCaseId(null)}
        availableOwners={availableOwners}
        onAssignOwner={(caseId, owner) => {
          setWorklist((previous) => {
            if (!previous) return previous;

            return {
              ...previous,
              cases: previous.cases.map((item) =>
                item.id === caseId
                  ? {
                      ...item,
                      assignedTo: owner,
                      lastUpdated: new Date().toISOString(),
                    }
                  : item,
              ),
            };
          });
        }}
        onRecordAssistedResponse={(caseItem) => {
          setSelectedCaseId(null);

          navigate(
            `/assisted-response?caseId=${encodeURIComponent(
              caseItem.id,
            )}&patient=${encodeURIComponent(caseItem.patientLabel)}`,
          );
        }}
      />
    </main>
  );
}

export default WorklistPage;
