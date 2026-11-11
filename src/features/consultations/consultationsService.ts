import type {
  ConsultationResponse,
  ConsultationActionResponse,
  AcceptConsultationRequest,
  EscalateConsultationRequest,
  RecordConsultationOutcomeRequest,
} from "./consultations.types";

export async function getConsultations(): Promise<ConsultationResponse> {
  const response = await fetch("/api/consultations");

  if (!response.ok) {
    throw new Error(`Failed to fetch consultations: ${response.status}`);
  }

  return response.json();
}

export async function acceptConsultation(
  consultationId: string,
  payload: AcceptConsultationRequest
): Promise<ConsultationActionResponse> {
  const response = await fetch(
    `/api/consultations/${consultationId}/accept`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to accept consultation: ${response.status}`);
  }

  return response.json();
}


export async function escalateConsultation(
  consultationId: string,
  payload: EscalateConsultationRequest
): Promise<ConsultationActionResponse> {
  const response = await fetch(
    `/api/consultations/${consultationId}/escalate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to escalate consultation: ${response.status}`);
  }

  return response.json();
}


export async function recordConsultationOutcome(
  consultationId: string,
  payload: RecordConsultationOutcomeRequest
): Promise<ConsultationActionResponse> {
  const response = await fetch(
    `/api/consultations/${consultationId}/outcome`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to record consultation outcome: ${response.status}`
    );
  }

  return response.json();
}

