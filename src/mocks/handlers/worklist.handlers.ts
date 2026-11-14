import { http, HttpResponse } from "msw";
import { getDemoWorklistResponse } from "../../features/worklist/demoState";

export const worklistHandlers = [
  http.get("/api/worklist", ({ request }) => {
    const url = new URL(request.url);
    const facilityId = url.searchParams.get("facilityId");

    if (!facilityId) {
      return HttpResponse.json(
        { message: "Facility ID is required." },
        { status: 400 },
      );
    }

    const facilityNames: Record<string, string> = {
      "demo-facility": "Demo Facility",
      "central-specialist": "Central Specialist Hospital",
    };

    const facilityName = facilityNames[facilityId];

    if (!facilityName) {
      return HttpResponse.json(
        { message: "Unknown facility." },
        { status: 400 },
      );
    }

    const response = getDemoWorklistResponse();
    const cases = response.cases.filter(
      (item) => item.facility === facilityName,
    );

    return HttpResponse.json({
      ...response,
      cases,
      total: cases.length,
      summary: {
        totalCases: cases.length,
        urgentCases: cases.filter((item) => item.priority === "urgent").length,
        overdueCases: cases.filter(
          (item) =>
            item.dueDate !== null &&
            new Date(item.dueDate) < new Date() &&
            item.status !== "Closed",
        ).length,
        unassignedCases: cases.filter((item) => !item.assignedTo).length,
      },
    });
  }),
];