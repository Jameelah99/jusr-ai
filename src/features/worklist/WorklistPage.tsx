import "./worklist.css";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import WorklistStats from "./components/WorklistStats";
import WorklistFilters from "./components/WorklistFilters";
import WorklistTable from "./components/WorklistTable";
import CaseDetails from "./components/CaseDetails";
import {
  getWorklist,
  getCaseTimeline,
  routeUrgentCase,
  acceptUrgentCase,
  transitionCase,
} from "../../services/api/worklistService";
import type {
  WorklistFilters as FilterValues,
  WorklistResponse,
  CaseTimelineEvent,
  ClosureEvidenceItem,
  ClosureType,
} from "./worklist.types";
import {
  updateDemoCase,
} from "./demoState";
import { useUser } from "../../context/UserContext";


function WorklistPage() {
  const { activeUser } = useUser();
  const [worklist, setWorklist] = useState<WorklistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    priority: "all",
    status: "all",
    facility: "all",
    assignedTo: "all",
  });
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<CaseTimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  async function loadWorklist() {
    try {
      setLoading(true);
      setError(null);

      if (!activeUser) return;
      const data = await getWorklist(activeUser.facility.id);
      setWorklist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load worklist.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeUser) loadWorklist();
  }, [activeUser]);

  const cases = useMemo(() => {
    if (!activeUser || activeUser.role === "facility_administrator") {
      return [];
    }

    return worklist?.cases ?? [];
  }, [worklist?.cases, activeUser]);

  const summary = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const openCases = cases.filter(
      (item) => !item.closure && item.status !== "Closed",
    );

    return {
      totalCases: cases.length,
      urgentCases: openCases.filter((item) => item.priority === "urgent")
        .length,
      overdueCases: openCases.filter(
        (item) => item.dueDate && new Date(`${item.dueDate}T00:00:00`) < today,
      ).length,
      unassignedCases: openCases.filter((item) => item.assignedTo === null)
        .length,
    };
  }, [cases]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const requestedCaseId = searchParams.get("caseId");

    if (!requestedCaseId || cases.length === 0) return;

    const matchingCase = cases.find((item) => item.id === requestedCaseId);

    if (matchingCase) {
      setSelectedCaseId(matchingCase.id);
    }
  }, [cases, location.search]);

  const selectedCase = cases.find((item) => item.id === selectedCaseId) ?? null;

  useEffect(() => {
    let cancelled = false;

    if (!selectedCaseId) {
      setTimelineEvents([]);
      setTimelineError(null);
      setTimelineLoading(false);
      return;
    }

    async function loadTimeline() {
      try {
        setTimelineLoading(true);
        setTimelineError(null);
        const requestedCaseId = selectedCaseId;
        if (!requestedCaseId) return;

        const events = await getCaseTimeline(requestedCaseId);
        if (!cancelled) setTimelineEvents(events);
      } catch (err) {
        if (!cancelled) {
          setTimelineEvents([]);
          setTimelineError(
            err instanceof Error ? err.message : "Unable to load case history.",
          );
        }
      } finally {
        if (!cancelled) setTimelineLoading(false);
      }
    }

    loadTimeline();
    return () => {
      cancelled = true;
    };
  }, [selectedCaseId]);

    const handleCloseCase = async (
    caseId: string,
    closureType: ClosureType,
    reason: string,
    submittedEvidence: ClosureEvidenceItem[],
    secondApproverId?: string,
  ) => {
    const currentCase = cases.find((item) => item.id === caseId);

    if (!activeUser || !currentCase || currentCase.closure) {
      return;
    }

    if (!reason.trim()) {
      window.alert("Please provide a closure reason.");
      return;
    }

    try {
      await transitionCase(caseId, {
        status: "CLOSED",
        closureType,
        reason: reason.trim(),
        closureEvidence: submittedEvidence,
        ...(secondApproverId
          ? { secondApproverStaffId: secondApproverId }
          : {}),
      });

      await loadWorklist();

      const events = await getCaseTimeline(caseId);
      setTimelineEvents(events);
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Unable to close this case. Please check the case requirements.",
      );
    }
  };

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

  if (!activeUser) {
    return (
      <div className="worklist-state">
        <p>Loading your staff account...</p>
      </div>
    );
  }

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

      <WorklistStats summary={summary} />

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

      {selectedCase !== null && timelineLoading && (
        <p className="worklist-timeline-status">Loading case history...</p>
      )}
      {selectedCase !== null && timelineError && (
        <p className="worklist-timeline-status" role="alert">
          {timelineError}
        </p>
      )}
      {selectedCase !== null && (
        <CaseDetails
          caseItem={selectedCase}
          activeUser={activeUser}
          onCloseCase={handleCloseCase}
          timelineEvents={timelineEvents.filter(
            (event) => event.caseId === selectedCase?.id,
          )}
          onClose={() => {
            setSelectedCaseId(null);

            const state = location.state as {
              returnTo?: string;
            } | null;

            if (state?.returnTo) {
              navigate(state.returnTo, { replace: true });
            } else {
              navigate("/worklist", { replace: true });
            }
          }}
          availableOwners={availableOwners}
          onRouteUrgentCase={async (caseId, clinician) => {
            const currentCase = cases.find((item) => item.id === caseId);

            if (
              !currentCase ||
              currentCase.closure ||
              currentCase.status === "Closed" ||
              currentCase.priority !== "urgent"
            ) {
              return;
            }

            try {
              await routeUrgentCase(caseId, { specialty: clinician });

              await loadWorklist();

              if (selectedCaseId) {
                const events = await getCaseTimeline(caseId);
                setTimelineEvents(events);
              }
            } catch (err) {
              window.alert(
                err instanceof Error
                  ? err.message
                  : "Unable to route this urgent case.",
              );
            }
          }}
          onAcceptUrgentCase={async (caseId) => {
            const currentCase = cases.find((item) => item.id === caseId);

            if (
              !currentCase ||
              currentCase.closure ||
              currentCase.status === "Closed" ||
              currentCase.priority !== "urgent" ||
              currentCase.routingStatus !== "awaiting_acceptance"
            ) {
              return;
            }

            try {
              await acceptUrgentCase(caseId);

              await loadWorklist();

              const events = await getCaseTimeline(caseId);
              setTimelineEvents(events);
            } catch (err) {
              window.alert(
                err instanceof Error
                  ? err.message
                  : "Unable to accept this urgent case.",
              );
            }
          }}
          onAssignOwner={(caseId, owner) => {
            const currentCase = cases.find((item) => item.id === caseId);

            if (
              !currentCase ||
              currentCase.closure ||
              currentCase.status === "Closed"
            ) {
              return;
            }

            const previousOwner = currentCase.assignedTo;

            // Do not record an event if ownership has not changed.
            if (previousOwner === owner) return;

            const now = new Date().toISOString();

            const updatedCase = updateDemoCase(caseId, {
              assignedTo: owner,
              lastUpdated: now,
            });

            if (!updatedCase) return;

            setWorklist((previous) =>
              previous
                ? {
                    ...previous,
                    cases: previous.cases.map((item) =>
                      item.id === caseId ? updatedCase : item,
                    ),
                  }
                : previous,
            );
          }}
          onRecordAssistedResponse={(caseItem) => {
            if (caseItem.closure || caseItem.status === "Closed") return;

            setSelectedCaseId(null);

            navigate(
              `/assisted-response?caseId=${encodeURIComponent(
                caseItem.id,
              )}&patient=${encodeURIComponent(caseItem.patientLabel)}`,
            );
          }}
        />
      )}
    </main>
  );
}

export default WorklistPage;
