import { http, HttpResponse } from "msw";
import {
  getDemoWorklistState,
  updateDemoCase,
  addDemoTimelineEvent,
} from "../../features/worklist/demoState";

const DEMO_RECEIVING_USER = {
  id: "user-004",
  name: "Dr Okafor",
};

export const urgentInboxHandlers = [
  http.get("/api/urgent-routes/inbox", ({ request }) => {
    const url = new URL(request.url);
    const demoUserId = url.searchParams.get("demoUserId");

    if (demoUserId !== DEMO_RECEIVING_USER.id) {
      return HttpResponse.json(
        { message: "Access denied" },
        { status: 403 }
      );
    }

    const { cases } = getDemoWorklistState();

    const incomingCases = cases.filter(
      (item) =>
        item.priority === "urgent" &&
        item.assignedTo === DEMO_RECEIVING_USER.name &&
        item.routingStatus === "awaiting_acceptance"
    );

    return HttpResponse.json(incomingCases);
  }),

  http.post(
    "/api/cases/:caseId/urgent-route/accept",
    ({ request, params }) => {
      const demoUserId = request.headers.get("X-Demo-User-Id");

      if (demoUserId !== DEMO_RECEIVING_USER.id) {
        return HttpResponse.json(
          { message: "Access denied" },
          { status: 403 }
        );
      }

      const { cases } = getDemoWorklistState();

      const caseItem = cases.find(
        (item) => item.id === params.caseId
      );

      if (!caseItem) {
        return HttpResponse.json(
          { message: "Case not found" },
          { status: 404 }
        );
      }

      if (
        caseItem.priority !== "urgent" ||
        caseItem.assignedTo !== DEMO_RECEIVING_USER.name ||
        caseItem.routingStatus !== "awaiting_acceptance"
      ) {
        return HttpResponse.json(
          { message: "This urgent case cannot be accepted." },
          { status: 409 }
        );
      }

      if (
        !caseItem.specialty ||
        caseItem.assignedClinicianSpecialty !== caseItem.specialty
      ) {
        return HttpResponse.json(
          { message: "Specialty requirement not satisfied." },
          { status: 422 }
        );
      }

      const timestamp = new Date().toISOString();

      const updatedCase = updateDemoCase(caseItem.id, {
        routingStatus: "accepted",
        status: "Notifying",
        lastUpdated: timestamp,
      });

      if (!updatedCase) {
        return HttpResponse.json(
          { message: "Unable to update case." },
          { status: 500 }
        );
      }

      addDemoTimelineEvent({
        id: `EVT-${Date.now()}`,
        caseId: updatedCase.id,
        eventType: "urgent_case_accepted",
        title: "Urgent case accepted",
        description:
          "The assigned receiving clinician accepted the urgent case.",
        actor: DEMO_RECEIVING_USER.name,
        actorRole: "Receiving Clinician",
        timestamp,
      });

      return HttpResponse.json(updatedCase);
    }
  ),
];