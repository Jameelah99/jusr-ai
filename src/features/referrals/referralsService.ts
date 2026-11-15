
import { apiRequest } from "../../services/api/apiClient";
import type {
  Referral,
  ReferralApiRecord,
  ReferralResponse,
  ReferralActionResponse,
  RejectReferralRequest,
  EscalateReferralRequest,
} from "./referrals.types";

function mapReferral(record: ReferralApiRecord): Referral {
  const status = record.status.toLowerCase();

  return {
    id: record.id,
    caseId: record.case.caseId,
    patientLabel: record.case.patient.displayLabel,
    screeningType: record.case.screening?.type ?? "Not recorded",
    priority: record.case.priority.toLowerCase() as Referral["priority"],

    referringFacility: record.referringFacility?.name ?? "Not recorded",
    receivingFacility: record.receivingFacility?.name ?? "Not assigned",

    referringClinician: record.referredBy?.displayName ?? "Not recorded",
    receivingClinician: record.receivingClinician?.displayName ?? null,

    referralReason: record.reason,
    clinicalSummary: "Not provided",

    status:
      record.escalated && status === "pending"
        ? "escalated"
        : (status as Referral["status"]),

    createdAt: record.createdAt,
    responseDueAt: null,
    lastUpdated: record.updatedAt,

    rejectionReason: record.rejectionReason,
    escalationReason: record.escalationReason,
    outcome: record.consultation?.outcome ?? null,
  };
}

function mapReferralResponse(
  records: ReferralApiRecord[]
): ReferralResponse {
  const referrals = records.map(mapReferral);

  return {
    referrals,
    summary: {
      totalReferrals: referrals.length,
      pendingReferrals: referrals.filter(
        (item) => item.status === "pending"
      ).length,
      acceptedReferrals: referrals.filter(
        (item) => item.status === "accepted"
      ).length,
      rejectedReferrals: referrals.filter(
        (item) => item.status === "rejected"
      ).length,
      escalatedReferrals: referrals.filter(
        (item) => item.status === "escalated"
      ).length,
    },
    total: referrals.length,
    page: 1,
    pageSize: referrals.length,
    totalPages: referrals.length > 0 ? 1 : 0,
  };
}

export async function getReferrals(): Promise<ReferralResponse> {
  const records = await apiRequest<ReferralApiRecord[]>("/api/referrals");

  return mapReferralResponse(records);
}

export async function acceptReferral(
  referralId: string
): Promise<ReferralActionResponse> {
  const record = await apiRequest<ReferralApiRecord>(
    `/api/referrals/${referralId}/accept`,
    {
      method: "POST",
    }
  );

  return {
    success: true,
    referral: mapReferral(record),
  };
}

export async function rejectReferral(
  referralId: string,
  payload: RejectReferralRequest
): Promise<ReferralActionResponse> {
  const record = await apiRequest<ReferralApiRecord>(
    `/api/referrals/${referralId}/reject`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  return {
    success: true,
    referral: mapReferral(record),
  };
}

export async function escalateReferral(
  referralId: string,
  payload: EscalateReferralRequest
): Promise<ReferralActionResponse> {
  const record = await apiRequest<ReferralApiRecord>(
    `/api/referrals/${referralId}/escalate`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  return {
    success: true,
    referral: mapReferral(record),
  };
}
