import { http, HttpResponse } from "msw";
import { consultationsResponseMock } from "../../features/consultations/consultations.mock";

export const consultationsHandlers = [
  http.get("/api/consultations", () => {
    return HttpResponse.json(consultationsResponseMock);
  }),

  http.post(
    "/api/consultations/:consultationId/accept",
    async ({ params, request }) => {
      const consultation = consultationsResponseMock.consultations.find(
        (item) => item.id === params.consultationId,
      );

      if (!consultation) {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: "CONSULTATION_NOT_FOUND",
              message: "Consultation not found.",
            },
          },
          { status: 404 },
        );
      }

      if (consultation.status !== "REQUESTED") {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_CONSULTATION_STATE",
              message: "Only requested consultations can be accepted.",
            },
          },
          { status: 409 },
        );
      }

      const body = (await request.json()) as {
        receivingClinician: string;
      };

      if (!body.receivingClinician?.trim()) {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Receiving clinician is required.",
            },
          },
          { status: 400 },
        );
      }

      consultation.status = "ACCEPTED";
      consultation.receivingClinician = body.receivingClinician;
      consultation.acceptedAt = new Date().toISOString();

      return HttpResponse.json({
        success: true,
        consultation,
      });
    },
  ),

  http.post(
    "/api/consultations/:consultationId/escalate",
    async ({ params, request }) => {
      const consultation = consultationsResponseMock.consultations.find(
        (item) => item.id === params.consultationId,
      );

      if (!consultation) {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: "CONSULTATION_NOT_FOUND",
              message: "Consultation not found.",
            },
          },
          { status: 404 },
        );
      }

      if (consultation.status !== "REQUESTED") {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_CONSULTATION_STATE",
              message: "Only requested consultations can be escalated.",
            },
          },
          { status: 409 },
        );
      }

      const body = (await request.json()) as { reason: string };

      if (!body.reason?.trim()) {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "An escalation reason is required.",
            },
          },
          { status: 400 },
        );
      }

      consultation.status = "ESCALATED";
      consultation.escalationReason = body.reason.trim();

      return HttpResponse.json({
        success: true,
        consultation,
      });
    },
  ),

  http.post(
    "/api/consultations/:consultationId/outcome",
    async ({ params, request }) => {
      const consultation = consultationsResponseMock.consultations.find(
        (item) => item.id === params.consultationId,
      );

      if (!consultation) {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: "CONSULTATION_NOT_FOUND",
              message: "Consultation not found.",
            },
          },
          { status: 404 },
        );
      }

      if (consultation.status !== "ACCEPTED") {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_CONSULTATION_STATE",
              message:
                "Only accepted consultations can have an outcome recorded.",
            },
          },
          { status: 409 },
        );
      }

      const body = (await request.json()) as {
        outcome: string;
        outcomeNote: string;
      };

      if (!body.outcome?.trim() || !body.outcomeNote?.trim()) {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message:
                "Both consultation outcome and outcome note are required.",
            },
          },
          { status: 400 },
        );
      }

      consultation.status = "OUTCOME_RECORDED";
      consultation.outcome = body.outcome.trim();
      consultation.outcomeNote = body.outcomeNote.trim();
      consultation.outcomeRecordedAt = new Date().toISOString();

      return HttpResponse.json({
        success: true,
        consultation,
      });
    },
  ),
];
