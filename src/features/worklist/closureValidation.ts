
import type {
  ClosureEvidenceKind,
  ClosureEvidenceItem,
  ClosureType,
  WorklistCase,
} from "./worklist.types";

type EvidenceRequirement = {
  label: string;
  alternatives: ClosureEvidenceKind[];
};

export interface ClosureValidationResult {
  canClose: boolean;
  missing: string[];
  message?: string;
}

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
      label: "Logged contact attempts",
      alternatives: ["contact_attempts"],
    },
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

function hasValidEvidence(
  evidence: ClosureEvidenceItem[],
  alternatives: ClosureEvidenceKind[],
): boolean {
  return evidence.some(
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
): ClosureValidationResult {
  if (caseItem.flags?.includes("DATA_MISSING")) {
    return {
      canClose: false,
      missing: [],
      message:
        "Data missing: this case cannot be closed until the missing data is resolved.",
    };
  }

  if (!reason.trim()) {
    return {
      canClose: false,
      missing: ["A closure reason is required."],
    };
  }

  const missing = closureRequirements[closureType]
    .filter(
      (requirement) =>
        !hasValidEvidence(evidence, requirement.alternatives),
    )
    .map((requirement) => requirement.label);

  if (closureType === "other" && !secondApprover?.trim()) {
    missing.push("A second authorised person's approval is required.");
  }

  return {
    canClose: missing.length === 0,
    missing,
  };
}
