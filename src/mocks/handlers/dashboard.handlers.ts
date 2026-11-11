
import { http, HttpResponse } from "msw";

import {
  dashboardMock,
  centralSpecialistDashboardMock,
  referringClinicianDashboardMock,
  facilityAdministratorDashboardMock,
} from "../../features/dashboard/dashboard.mock";

import { referralsMock } from "../../features/referrals/referrals.mock";
import type { ReceivingClinicianDashboard } from "../../features/dashboard/dashboard.types";

export const dashboardHandlers = [
  http.get("/api/dashboard/summary", ({ request }) => {
    const url = new URL(request.url);
    const role = url.searchParams.get("role");
    const facilityId = url.searchParams.get("facilityId");

    if (role === "coordinator") {
      if (facilityId === "central-specialist") {
        return HttpResponse.json(centralSpecialistDashboardMock);
      }

      return HttpResponse.json(dashboardMock);
    }

    switch (role) {
      case "referring_clinician":
        return HttpResponse.json(referringClinicianDashboardMock);

      case "receiving_clinician": {
        const incomingReferrals = referralsMock.filter(
          (referral) =>
            referral.receivingFacility === "Central Specialist Hospital",
        );

        const dashboardData: ReceivingClinicianDashboard = {
          pendingReferrals: incomingReferrals.filter(
            (referral) => referral.status === "pending",
          ).length,

          acceptedReferrals: incomingReferrals.filter(
            (referral) => referral.status === "accepted",
          ).length,

          urgentReferrals: incomingReferrals.filter(
            (referral) =>
              referral.priority === "urgent" &&
              referral.status === "pending",
          ).length,

          referrals: incomingReferrals.map((referral) => ({
            id: referral.id,
            patientLabel: referral.patientLabel,
            screeningType: referral.screeningType,
            priority: referral.priority,
            referringFacility: referral.referringFacility,
            referralReason: referral.referralReason,
            receivedAt: new Date(referral.createdAt).toLocaleString(
              "en-GB",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              },
            ),
            status: referral.status,
          })),
        };

        return HttpResponse.json(dashboardData);
      }

      case "facility_administrator":
        return HttpResponse.json(facilityAdministratorDashboardMock);

      default:
        return HttpResponse.json(
          { message: "Invalid dashboard role." },
          { status: 400 },
        );
    }
  }),
];
