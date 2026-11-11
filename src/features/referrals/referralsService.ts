import type {
  ReferralResponse,
  ReferralActionResponse,
  RejectReferralRequest,
  EscalateReferralRequest,
} from "./referrals.types";

export async function getReferrals(): Promise<ReferralResponse> {
  const response = await fetch("/api/referrals");

  if (!response.ok) {
    throw new Error("Unable to load referrals.");
  }

  return response.json();
}

export async function acceptReferral(
  referralId: string
): Promise<ReferralActionResponse> {
  const response = await fetch(
    `/api/referrals/${referralId}/accept`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Unable to accept referral.");
  }

  return response.json();
}

export async function rejectReferral(
  referralId: string,
  payload: RejectReferralRequest
): Promise<ReferralActionResponse> {
  const response = await fetch(
    `/api/referrals/${referralId}/reject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Unable to reject referral.");
  }

  return response.json();
}


export async function escalateReferral(
  referralId: string,
  payload: EscalateReferralRequest
): Promise<ReferralActionResponse> {
  const response = await fetch(
    `/api/referrals/${referralId}/escalate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error("Unable to escalate referral.");
  }

  return response.json();
}
