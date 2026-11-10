import type { ReferralResponse } from "./referrals.types";

export async function getReferrals(): Promise<ReferralResponse> {
  const response = await fetch("/api/referrals");

  if (!response.ok) {
    throw new Error("Unable to load referrals.");
  }

  return response.json();
}
