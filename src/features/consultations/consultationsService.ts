
import { apiRequest } from "../../services/api/apiClient";
import { getReferrals } from "../referrals/referralsService";
import type {
  Consultation,
  ConsultationResponse,
  ConsultationActionResponse,
  RecordConsultationOutcomeRequest,
} from "./consultations.types";

function mapConsultation(
  referral: Awaited<ReturnType<typeof getReferrals>>["referrals"][number]
): Consultation {
  const hasOutcome = Boolean(referral.outcome);

  return {
    id: referral.id,
    caseId: referral.caseId,
    patientLabel: referral.patientLabel,
    screeningType: referral.screeningType,
    priority: referral.priority,
    referringFacility: referral.referringFacility,
    receivingFacility: referral.receivingFacility,
    referringClinician: referral.referringClinician,
    receivingClinician: referral.receivingClinician,
    reason: referral.referralReason,
    status: hasOutcome ? "OUTCOME_RECORDED" : "ACCEPTED",
    requestedAt: referral.createdAt,
    acceptedAt: null,
    outcomeRecordedAt: null,
    outcome: referral.outcome,
    outcomeNote: null,
    escalationReason: null,
  };
}

export async function getConsultations(): Promise<ConsultationResponse> {
  const response = await getReferrals();

  const consultations = response.referrals
    .filter(
      (referral) =>
        referral.status === "accepted" ||
        referral.status === "outcome_recorded"
    )
    .map(mapConsultation);

  return {
    consultations,
    total: consultations.length,
  };
}

export async function recordConsultationOutcome(
  referralId: string,
  payload: RecordConsultationOutcomeRequest
): Promise<ConsultationActionResponse> {
  const outcome = [payload.outcome.trim(), payload.outcomeNote.trim()]
    .filter(Boolean)
    .join("\n\n");

  await apiRequest(`/api/referrals/${referralId}/consultation`, {
    method: "POST",
    body: JSON.stringify({ outcome }),
  });

  const response = await getConsultations();

  const consultation = response.consultations.find(
    (item) => item.id === referralId
  );

  if (!consultation) {
    throw new Error("Consultation was saved, but the updated record could not be loaded.");
  }

  return {
    success: true,
    consultation,
  };
}
