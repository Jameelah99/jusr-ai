import { worklistMock, caseTimelineMock } from "./worklist.mock";

import type {
  WorklistCase,
  WorklistResponse,
  CaseTimelineEvent,
  CaseEvidenceRecord,
  ClosureEvidenceItem,
  ContactAttemptRecord,
  CaseDelayRecord,
} from "./worklist.types";

const STORAGE_KEY = "jusr-demo-worklist-state";

const DEMO_DATA_CHANGED_EVENT = "jusr-demo-data-changed";

export function notifyDemoDataChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(DEMO_DATA_CHANGED_EVENT));
  }
}

export function subscribeToDemoDataChanges(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(DEMO_DATA_CHANGED_EVENT, callback);

  return () => {
    window.removeEventListener(DEMO_DATA_CHANGED_EVENT, callback);
  };
}

interface DemoWorklistState {
  cases: WorklistCase[];
  timelineEvents: CaseTimelineEvent[];
  evidenceRecords: CaseEvidenceRecord[];
  contactAttempts: ContactAttemptRecord[];
  delayRecords: CaseDelayRecord[];
}

function getInitialState(): DemoWorklistState {
  return {
    cases: worklistMock.cases.map((item) => ({ ...item })),
    timelineEvents: caseTimelineMock.map((event) => ({ ...event })),
    evidenceRecords: [],
    contactAttempts: [],
    delayRecords: [],
  };
}

export function getDemoWorklistState(): DemoWorklistState {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);

    if (savedState) {
      const parsed = JSON.parse(savedState) as DemoWorklistState;

      if (Array.isArray(parsed.cases) && Array.isArray(parsed.timelineEvents)) {
        const savedCasesById = new Map(
          parsed.cases.map((item) => [item.id, item]),
        );

        const mergedCases = worklistMock.cases.map((seedCase) => ({
          ...seedCase,
          ...savedCasesById.get(seedCase.id),
        }));

        const newSavedCases = parsed.cases.filter(
          (savedCase) =>
            !worklistMock.cases.some(
              (seedCase) => seedCase.id === savedCase.id,
            ),
        );

        return {
          ...parsed,
          cases: [...mergedCases, ...newSavedCases],
          evidenceRecords: Array.isArray(parsed.evidenceRecords)
            ? parsed.evidenceRecords
            : [],
          contactAttempts: Array.isArray(parsed.contactAttempts)
            ? parsed.contactAttempts
            : [],
          delayRecords: Array.isArray(parsed.delayRecords)
            ? parsed.delayRecords
            : [],
        };
      }
    }
  } catch {
    // Fall back to the original demo data.
  }

  return getInitialState();
}

export function saveDemoWorklistState(state: DemoWorklistState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  notifyDemoDataChanged();
}

export function getDemoWorklistResponse(): WorklistResponse {
  const state = getDemoWorklistState();

  return {
    ...worklistMock,
    cases: state.cases,
    total: state.cases.length,
  };
}

export function updateDemoCase(
  caseId: string,
  updates: Partial<WorklistCase>,
): WorklistCase | null {
  const state = getDemoWorklistState();

  const index = state.cases.findIndex((item) => item.id === caseId);

  if (index === -1) return null;

  state.cases[index] = {
    ...state.cases[index],
    ...updates,
  };

  saveDemoWorklistState(state);

  return state.cases[index];
}

export function addDemoTimelineEvent(event: CaseTimelineEvent): void {
  const state = getDemoWorklistState();

  state.timelineEvents.unshift(event);

  saveDemoWorklistState(state);
}

export function getDemoTimelineEvents(): CaseTimelineEvent[] {
  return getDemoWorklistState().timelineEvents;
}

export function getDemoEvidenceRecords(caseId: string): CaseEvidenceRecord[] {
  return getDemoWorklistState().evidenceRecords.filter(
    (record) => record.caseId === caseId,
  );
}

export function addDemoEvidenceRecord(record: CaseEvidenceRecord): void {
  const state = getDemoWorklistState();

  state.evidenceRecords.push(record);

  saveDemoWorklistState(state);
}

export function getClosureEvidenceChecklist(
  caseId: string,
): ClosureEvidenceItem[] {
  return getDemoEvidenceRecords(caseId).map((record) => ({
    id: record.id,
    kind: record.kind,
    label: record.title,
    present: true,
    sourceRecordId: record.id,
    sourceDescription: record.description,
  }));
}

// TEMPORARY: Used to test DATA_MISSING closure validation.
export function setDemoMissingDataFlag(
  caseId: string,
  enabled: boolean,
): WorklistCase | null {
  const currentCase = getDemoWorklistState().cases.find(
    (item) => item.id === caseId,
  );

  if (!currentCase) return null;

  const flags = new Set(currentCase.flags ?? []);

  if (enabled) {
    flags.add("DATA_MISSING");
  } else {
    flags.delete("DATA_MISSING");
  }

  return updateDemoCase(caseId, {
    flags: Array.from(flags),
  });
}

export function getDemoContactAttempts(caseId: string): ContactAttemptRecord[] {
  return getDemoWorklistState()
    .contactAttempts.filter((attempt) => attempt.caseId === caseId)
    .sort(
      (a, b) =>
        new Date(a.attemptedAt).getTime() - new Date(b.attemptedAt).getTime(),
    );
}

export function addDemoContactAttempt(attempt: ContactAttemptRecord): void {
  const state = getDemoWorklistState();

  const currentCase = state.cases.find((item) => item.id === attempt.caseId);

  if (!currentCase || currentCase.closure || currentCase.status === "Closed") {
    throw new Error("Contact attempts can only be recorded for open cases.");
  }

  state.contactAttempts.push(attempt);

  const routeLabel = attempt.route === "phone" ? "Phone call" : "Message";

  const outcomeLabel = attempt.outcome.replace(/_/g, " ");

  const timelineEvent: CaseTimelineEvent = {
    id: `EVENT-CONTACT-${attempt.id}`,
    caseId: attempt.caseId,
    eventType: "contact_attempt_recorded",
    title: "Patient contact attempt recorded",
    description: [
      `${routeLabel} attempt recorded with outcome: ${outcomeLabel}.`,
      `Attempted at: ${new Date(attempt.attemptedAt).toLocaleString("en-GB")}.`,
      ...(attempt.notes?.trim() ? [`Notes: ${attempt.notes.trim()}`] : []),
    ].join(" "),
    actor: attempt.recordedBy,
    actorRole: attempt.recordedByRole,
    timestamp: attempt.recordedAt,
  };

  state.timelineEvents.unshift(timelineEvent);

  saveDemoWorklistState(state);
}

export function getDemoCaseDelayRecords(caseId: string): CaseDelayRecord[] {
  return getDemoWorklistState().delayRecords.filter(
    (record) => record.caseId === caseId,
  );
}

export function addDemoCaseDelayRecord(record: CaseDelayRecord): void {
  const state = getDemoWorklistState();

  const currentCase = state.cases.find((item) => item.id === record.caseId);

  if (!currentCase || currentCase.closure || currentCase.status === "Closed") {
    throw new Error("Delay reasons can only be recorded for open cases.");
  }

  if (!currentCase.flags?.includes("OVERDUE")) {
    throw new Error(
      "A reason for delay can only be recorded for an overdue case.",
    );
  }

  if (record.reasonCode === "other" && !record.explanation?.trim()) {
    throw new Error(
      "An explanation is required when the reason for delay is Other.",
    );
  }

  state.delayRecords.push(record);

  state.timelineEvents.unshift({
    id: `EVENT-DELAY-${record.id}`,
    caseId: record.caseId,
    eventType: "case_delay_recorded",
    title: "Reason for delay recorded",
    description: [
      `Reason: ${record.reasonCode.replace(/_/g, " ")}.`,
      ...(record.explanation?.trim()
        ? [`Explanation: ${record.explanation.trim()}.`]
        : []),
    ].join(" "),
    actor: record.recordedBy,
    actorRole: record.recordedByRole,
    timestamp: record.recordedAt,
  });

  saveDemoWorklistState(state);
}
