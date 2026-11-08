
import type { DashboardSummary } from "../../features/dashboard/dashboard.types";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await fetch("/api/dashboard/summary");

  if (!response.ok) {
    throw new Error(
      `Failed to fetch dashboard summary: ${response.status}`
    );
  }

  const data: DashboardSummary = await response.json();

  return data;
}
