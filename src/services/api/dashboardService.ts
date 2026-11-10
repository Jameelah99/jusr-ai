
import type { DashboardData } from "../../features/dashboard/dashboard.types";

export async function getDashboardSummary(
  role: string,
  facilityId: string
): Promise<DashboardData> {
  const params = new URLSearchParams({
    role,
    facilityId,
  });

  const response = await fetch(
    `/api/dashboard/summary?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch dashboard summary: ${response.status}`
    );
  }

  const data: DashboardData = await response.json();

  return data;
}
