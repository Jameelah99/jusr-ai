import type { WorklistCase } from "./worklist.types";

export async function getUrgentInbox(
  demoUserId: string,
): Promise<WorklistCase[]> {
  const response = await fetch(
    `/api/urgent-routes/inbox?demoUserId=${encodeURIComponent(demoUserId)}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch urgent inbox: ${response.status}`);
  }

  return response.json();
}

export async function acceptUrgentCase(
  caseId: string,
  demoUserId: string,
): Promise<WorklistCase> {
  const response = await fetch(`/api/cases/${caseId}/urgent-route/accept`, {
    method: "POST",
    headers: {
      "X-Demo-User-Id": demoUserId,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to accept urgent case: ${response.status}`);
  }

  return response.json();
}
