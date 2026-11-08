import { dashboardHandlers } from "./dashboard.handlers";
import { worklistHandlers } from "./worklist.handlers";

export const handlers = [
  ...dashboardHandlers,
  ...worklistHandlers,
];