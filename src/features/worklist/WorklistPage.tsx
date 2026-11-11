import "./worklist.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import WorklistStats from "./components/WorklistStats";
import WorklistFilters from "./components/WorklistFilters";
import WorklistTable from "./components/WorklistTable";
import CaseDetails from "./components/CaseDetails";
import { getWorklist } from "../../services/api/worklistService";
import type {
  WorklistFilters as FilterValues,
  WorklistResponse,
  CaseTimelineEvent,
} from "./worklist.types";
import {
  getDemoTimelineEvents,
  updateDemoCase,
  addDemoTimelineEvent,
} from "./demoState";
import { getEligiblePrimaryClinicians } from "./routing.service";

function WorklistPage() {
  const [worklist, setWorklist] = useState<WorklistResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const processedResponseRef = useRef<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    priority: "all",
    status: "all",
    facility: "all",
    assignedTo: "all",
  });
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<CaseTimelineEvent[]>(
    () => getDemoTimelineEvents(),
  );

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

  useEffect(() => {
    const state = location.state as {
      assistedResponseRecorded?: boolean;
      caseId?: string;
      recordedAt?: string;
      recordedBy?: string;
      staffRole?: string;
    } | null;

    if (
      !state?.assistedResponseRecorded ||
      !state.caseId ||
      !state.recordedAt ||
      !state.recordedBy ||
      !state.staffRole
    ) {
      return;
    }

    const eventKey = `${state.caseId}-${state.recordedAt}`;

    if (processedResponseRef.current === eventKey) return;

    processedResponseRef.current = eventKey;

    const newEvent: CaseTimelineEvent = {
      id: `EVENT-${Date.now()}`,
      caseId: state.caseId,
      eventType: "patient_response_recorded",
      title: "Patient response recorded by staff",
      description:
        "The coordinator recorded the patient's acknowledgement, understanding and confidence during a phone-assisted interaction.",
      actor: state.recordedBy,
      actorRole: state.staffRole,
      timestamp: state.recordedAt,
    };

    setTimelineEvents((previous) => [newEvent, ...previous]);

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.key, location.pathname, location.state, navigate]);

  const cases = worklist?.cases ?? [];

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

      {selectedCase !== null && (
        <CaseDetails
          caseItem={selectedCase}
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
          onRouteUrgentCase={(caseId, clinician) => {
            const currentCase = cases.find((item) => item.id === caseId);

            if (!currentCase || currentCase.priority !== "urgent") return;

            const eligibleClinicians =
              getEligiblePrimaryClinicians(currentCase);

            if (!eligibleClinicians.includes(clinician)) return;

            const now = new Date().toISOString();

            const updatedCase = updateDemoCase(caseId, {
              assignedTo: clinician,
              assignedClinicianSpecialty: currentCase.specialty,
              routingStatus: "awaiting_acceptance",
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

            addDemoTimelineEvent({
              id: `EVT-${Date.now()}`,
              caseId,
              eventType: "urgent_case_routed",
              title: "Urgent case routed to specialist",
              description: `Case routed to ${clinician} for ${currentCase.specialty} review. Awaiting acceptance.`,
              actor: "Demo Coordinator",
              actorRole: "Care Coordinator",
              timestamp: now,
            });

            setTimelineEvents(getDemoTimelineEvents());
          }}
          onAcceptUrgentCase={(caseId) => {
  const currentCase = cases.find((item) => item.id === caseId);

  if (
    !currentCase ||
    currentCase.priority !== "urgent" ||
    currentCase.routingStatus !== "awaiting_acceptance"
  ) {
    return;
  }

  const now = new Date().toISOString();

  const updatedCase = updateDemoCase(caseId, {
    routingStatus: "accepted",
    status: "Notifying",
    lastUpdated: now,
  });

  if (!updatedCase) return;

  setWorklist((previous) =>
    previous
      ? {
          ...previous,
          cases: previous.cases.map((item) =>
            item.id === caseId ? updatedCase : item
          ),
        }
      : previous
  );

  addDemoTimelineEvent({
    id: `EVT-${Date.now()}`,
    caseId,
    eventType: "urgent_case_accepted",
    title: "Urgent case accepted",
    description: `${currentCase.assignedTo} accepted the urgent ${currentCase.specialty} case.`,
    actor: currentCase.assignedTo ?? "Receiving Clinician",
    actorRole: "Receiving Clinician",
    timestamp: now,
  });

  setTimelineEvents(getDemoTimelineEvents());
}}
          onAssignOwner={(caseId, owner) => {
  const currentCase = cases.find((item) => item.id === caseId);

  if (!currentCase) return;

  const previousOwner = currentCase.assignedTo;
  const isReassignment = previousOwner !== null;
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
            item.id === caseId ? updatedCase : item
          ),
        }
      : previous
  );

  addDemoTimelineEvent({
    id: `EVT-${Date.now()}`,
    caseId,
    eventType: isReassignment ? "case_reassigned" : "case_assigned",
    title: isReassignment
      ? "Case owner reassigned"
      : "Case owner assigned",
    description: isReassignment
      ? `Case ownership changed from ${previousOwner} to ${owner}.`
      : `Case assigned to ${owner}.`,
    actor: "Demo Coordinator",
    actorRole: "Care Coordinator",
    timestamp: now,
  });

  setTimelineEvents(getDemoTimelineEvents());
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
      )}
    </main>
  );
}

export default WorklistPage;
