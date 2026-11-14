
import type { WorklistResponse } from "../../features/worklist/worklist.types";

export async function getWorklist(
  facilityId: string,
): Promise<WorklistResponse> {
  const response = await fetch(
    `/api/worklist?facilityId=${encodeURIComponent(facilityId)}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch worklist: ${response.status}`,
    );
  }

  const data: WorklistResponse = await response.json();

  return data;
}
