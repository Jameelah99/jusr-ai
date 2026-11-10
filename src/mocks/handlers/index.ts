import { dashboardHandlers } from "./dashboard.handlers";
import { worklistHandlers } from "./worklist.handlers";
import { referralsHandlers } from "./referralsHandlers";

export const handlers = [
  ...dashboardHandlers,
  ...worklistHandlers,
  ...referralsHandlers,
];