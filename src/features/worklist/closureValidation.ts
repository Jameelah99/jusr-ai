import type {
  ClosureEvidenceKind,
  ClosureEvidenceItem,
  ClosureType,
  ContactAttemptRecord,
  WorklistCase,
} from "./worklist.types";

type EvidenceRequirement = {
  label: string;
  alternatives: ClosureEvidenceKind[];
};

export interface ClosureChecklistItem {
  label: string;
  satisfied: boolean;
  supportingRecord?: ClosureEvidenceItem;
}

export interface ClosureValidationResult {
  canClose: boolean;
  missing: string[];
  checklist: ClosureChecklistItem[];
  message?: string;
}

export interface UnreachableClosureSettings {
  minAttempts: number;
  minDistinctRoutes: number;
  periodDays: number;
}

export interface ClosureValidationOptions {
  contactAttempts?: ContactAttemptRecord[];
  unreachableSettings?: UnreachableClosureSettings;
  now?: Date;
}

const DEFAULT_UNREACHABLE_SETTINGS: UnreachableClosureSettings = {
  minAttempts: 3,
  minDistinctRoutes: 2,
  periodDays: 7,
};

const closureRequirements: Record<ClosureType, EvidenceRequirement[]> = {
  care_confirmed: [
    {
      label: "Treatment start record or specialist outcome note",
      alternatives: ["treatment_start", "specialist_outcome"],
    },
  ],
  not_actionable: [
    {
      label: "Clinician decision record",
      alternatives: ["clinical_decision"],
    },
  ],
  no_further_care_needed: [
    {
      label: "Confirmatory result",
      alternatives: ["confirmatory_result"],
    },
    {
      label: "Clinician decision record",
      alternatives: ["clinical_decision"],
    },
  ],
  patient_declined: [
    {
      label: "Informed refusal record",
      alternatives: ["informed_refusal"],
    },
    {
      label: "Clinician decision record",
      alternatives: ["clinical_decision"],
    },
  ],
  unreachable: [
    {
      label: "Clinician decision record",
      alternatives: ["clinical_decision"],
    },
  ],
  moved_or_transferred: [
    {
      label: "Receiving provider acceptance or documented hand-off",
      alternatives: ["transfer_acceptance", "documented_handoff"],
    },
  ],
  other: [],
};

function findSupportingRecord(
  evidence: ClosureEvidenceItem[],
  alternatives: ClosureEvidenceKind[],
): ClosureEvidenceItem | undefined {
  return evidence.find(
    (item) =>
      alternatives.includes(item.kind) &&
      item.present === true &&
      Boolean(item.sourceRecordId?.trim()),
  );
}

export function validateClosure(
  caseItem: WorklistCase,
  closureType: ClosureType,
  reason: string,
  evidence: ClosureEvidenceItem[],
  secondApprover?: string,
  options: ClosureValidationOptions = {},
): ClosureValidationResult {
  const missing: string[] = [];
  const checklist: ClosureChecklistItem[] = [];

  if (caseItem.flags?.includes("DATA_MISSING")) {
    return {
      canClose: false,
      missing: [],
      checklist,
      message:
        "Data missing: this case cannot be closed until the missing data is resolved.",
    };
  }

  if (!reason.trim()) {
    missing.push("A closure reason is required.");
  }

  const requirements = closureRequirements[closureType] ?? [];

  for (const requirement of requirements) {
    const supportingRecord = findSupportingRecord(
      evidence,
      requirement.alternatives,
    );

    const satisfied = Boolean(supportingRecord);

    checklist.push({
      label: requirement.label,
      satisfied,
      supportingRecord,
    });

    if (!satisfied) {
      missing.push(requirement.label);
    }
  }

  if (closureType === "other" && !secondApprover?.trim()) {
    missing.push("A second authorised person's approval is required.");
  }

  if (closureType === "unreachable") {
    const settings = {
      ...DEFAULT_UNREACHABLE_SETTINGS,
      ...options.unreachableSettings,
    };

    const now = options.now ?? new Date();

    const attempts = (options.contactAttempts ?? [])
      .filter(
        (attempt) =>
          attempt.caseId === caseItem.id &&
          !Number.isNaN(new Date(attempt.attemptedAt).getTime()),
      )
      .sort(
        (a, b) =>
          new Date(a.attemptedAt).getTime() -
          new Date(b.attemptedAt).getTime(),
      );

    const firstAttempt = attempts[0];

    const periodStart = firstAttempt
      ? new Date(firstAttempt.attemptedAt).getTime()
      : null;

    const periodEnd =
      periodStart !== null
        ? periodStart + settings.periodDays * 24 * 60 * 60 * 1000
        : null;

    const attemptsInPeriod =
      periodStart !== null && periodEnd !== null
        ? attempts.filter((attempt) => {
            const attemptedAt = new Date(attempt.attemptedAt).getTime();

            return attemptedAt >= periodStart && attemptedAt <= periodEnd;
          })
        : [];

    const distinctRoutes = new Set(
      attemptsInPeriod.map((attempt) => attempt.route),
    );

    const attemptsSatisfied =
      attemptsInPeriod.length >= settings.minAttempts;

    const routesSatisfied =
      distinctRoutes.size >= settings.minDistinctRoutes;

    const periodSatisfied =
      periodEnd !== null && now.getTime() >= periodEnd;

    checklist.push(
      {
        label: `At least ${settings.minAttempts} contact attempts recorded`,
        satisfied: attemptsSatisfied,
      },
      {
        label: `Contact attempts made through at least ${settings.minDistinctRoutes} different routes`,
        satisfied: routesSatisfied,
      },
      {
        label: `${settings.periodDays}-day contact period completed`,
        satisfied: periodSatisfied,
      },
    );

    if (!attemptsSatisfied) {
      missing.push(
        `At least ${settings.minAttempts} contact attempts must be recorded.`,
      );
    }

    if (!routesSatisfied) {
      missing.push(
        `Contact attempts must use at least ${settings.minDistinctRoutes} different routes.`,
      );
    }

    if (!periodSatisfied) {
      missing.push(
        `The ${settings.periodDays}-day contact period must be completed.`,
      );
    }
  }

  return {
    canClose: missing.length === 0,
    missing,
    checklist,
    message:
      missing.length > 0
        ? "This case cannot be closed yet. Complete the outstanding requirements."
        : undefined,
  };
}