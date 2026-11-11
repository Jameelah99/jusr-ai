import {
  worklistMock,
  caseTimelineMock,
} from "./worklist.mock";

import type {
  WorklistCase,
  WorklistResponse,
  CaseTimelineEvent,
} from "./worklist.types";

const STORAGE_KEY = "jusr-demo-worklist-state";

interface DemoWorklistState {
  cases: WorklistCase[];
  timelineEvents: CaseTimelineEvent[];
}

function getInitialState(): DemoWorklistState {
  return {
    cases: worklistMock.cases.map((item) => ({ ...item })),
    timelineEvents: caseTimelineMock.map((event) => ({ ...event })),
  };
}

export function getDemoWorklistState(): DemoWorklistState {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);

    if (savedState) {
      const parsed = JSON.parse(savedState) as DemoWorklistState;

      if (
        Array.isArray(parsed.cases) &&
        Array.isArray(parsed.timelineEvents)
      ) {
        return parsed;
      }
    }
  } catch {
    // Fall back to the original demo data.
  }

  return getInitialState();
}

export function saveDemoWorklistState(
  state: DemoWorklistState
): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  updates: Partial<WorklistCase>
): WorklistCase | null {
  const state = getDemoWorklistState();

  const index = state.cases.findIndex(
    (item) => item.id === caseId
  );

  if (index === -1) return null;

  state.cases[index] = {
    ...state.cases[index],
    ...updates,
  };

  saveDemoWorklistState(state);

  return state.cases[index];
}

export function addDemoTimelineEvent(
  event: CaseTimelineEvent
): void {
  const state = getDemoWorklistState();

  state.timelineEvents.unshift(event);

  saveDemoWorklistState(state);
}

export function getDemoTimelineEvents(): CaseTimelineEvent[] {
  return getDemoWorklistState().timelineEvents;
}