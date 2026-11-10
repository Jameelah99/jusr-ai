
import { http, HttpResponse } from "msw";

import {
  dashboardMock,
  centralSpecialistDashboardMock,
  referringClinicianDashboardMock,
  receivingClinicianDashboardMock,
  facilityAdministratorDashboardMock,
} from "../../features/dashboard/dashboard.mock";

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

      case "receiving_clinician":
        return HttpResponse.json(receivingClinicianDashboardMock);

      case "facility_administrator":
        return HttpResponse.json(facilityAdministratorDashboardMock);

      default:
        return HttpResponse.json(
          { message: "Invalid dashboard role." },
          { status: 400 }
        );
    }
  }),
];
