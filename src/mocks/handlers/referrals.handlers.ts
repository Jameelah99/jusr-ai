import { http, HttpResponse } from "msw";
import {
  referralResponseMock,
  referralsMock,
  referralTimelineMock,
  saveReferralDemoState,
} from "../../features/referrals/referrals.mock";
import { notifyDemoDataChanged } from "../../features/worklist/demoState";

export const referralsHandlers = [
  http.get("/api/referrals", () => {
    const summary = {
      totalReferrals: referralsMock.length,
      pendingReferrals: referralsMock.filter(
        (item) => item.status === "pending",
      ).length,
      acceptedReferrals: referralsMock.filter(
        (item) => item.status === "accepted",
      ).length,
      rejectedReferrals: referralsMock.filter(
        (item) => item.status === "rejected",
      ).length,
      escalatedReferrals: referralsMock.filter(
        (item) => item.status === "escalated",
      ).length,
    };

    return HttpResponse.json({
      ...referralResponseMock,
      summary,
      referrals: referralsMock,
      total: referralsMock.length,
      totalPages: Math.ceil(referralsMock.length / 10),
    });
  }),

  http.post("/api/referrals/:id/accept", ({ params }) => {
    const referral = referralsMock.find((item) => item.id === params.id);

    if (!referral) {
      return HttpResponse.json(
        { message: "Referral not found." },
        { status: 404 },
      );
    }

    if (referral.status !== "pending") {
      return HttpResponse.json(
        { message: "This referral is no longer pending." },
        { status: 409 },
      );
    }

    referral.receivingClinician = "Dr Okafor";
    referral.status = "accepted";
    referral.lastUpdated = new Date().toISOString();

    referralTimelineMock.push({
      id: `REVT-${Date.now()}`,
      referralId: referral.id,
      eventType: "referral_accepted",
      title: "Referral accepted",
      description: "The receiving clinician accepted the referral.",
      actor: "Dr Okafor",
      actorRole: "Receiving Clinician",
      timestamp: referral.lastUpdated,
    });

    saveReferralDemoState();
    notifyDemoDataChanged();

    return HttpResponse.json({
      success: true,
      referral,
    });
  }),

  http.post("/api/referrals/:id/reject", async ({ params, request }) => {
    const referral = referralsMock.find((item) => item.id === params.id);

    if (!referral) {
      return HttpResponse.json(
        { message: "Referral not found." },
        { status: 404 },
      );
    }

    if (referral.status !== "pending") {
      return HttpResponse.json(
        { message: "This referral is no longer pending." },
        { status: 409 },
      );
    }

    const body = (await request.json()) as { reason?: string };
    const reason = body.reason?.trim();

    if (!reason) {
      return HttpResponse.json(
        { message: "A rejection reason is required." },
        { status: 400 },
      );
    }

    referral.receivingClinician = "Dr Okafor";
    referral.status = "rejected";
    referral.rejectionReason = reason;
    referral.lastUpdated = new Date().toISOString();

    referralTimelineMock.push({
      id: `REVT-${Date.now()}`,
      referralId: referral.id,
      eventType: "referral_rejected",
      title: "Referral rejected",
      description: reason,
      actor: "Dr Okafor",
      actorRole: "Receiving Clinician",
      timestamp: referral.lastUpdated,
    });

    saveReferralDemoState();
    notifyDemoDataChanged();

    return HttpResponse.json({
      success: true,
      referral,
    });
  }),

  http.post("/api/referrals/:id/escalate", async ({ params, request }) => {
    const referral = referralsMock.find((item) => item.id === params.id);

    if (!referral) {
      return HttpResponse.json(
        { message: "Referral not found." },
        { status: 404 },
      );
    }

    if (referral.status !== "pending") {
      return HttpResponse.json(
        { message: "Only pending referrals can be escalated." },
        { status: 409 },
      );
    }

    const body = (await request.json()) as { reason?: string };
    const reason = body.reason?.trim();

    if (!reason) {
      return HttpResponse.json(
        { message: "An escalation reason is required." },
        { status: 400 },
      );
    }

    referral.receivingClinician = "Dr Okafor";
    referral.status = "escalated";
    referral.escalationReason = reason;
    referral.lastUpdated = new Date().toISOString();

    referralTimelineMock.push({
      id: `REVT-${Date.now()}`,
      referralId: referral.id,
      eventType: "referral_escalated",
      title: "Referral escalated",
      description: reason,
      actor: "Dr Okafor",
      actorRole: "Receiving Clinician",
      timestamp: referral.lastUpdated,
    });

    saveReferralDemoState();
    notifyDemoDataChanged();

    return HttpResponse.json({
      success: true,
      referral,
    });
  }),
];
