import { dashboardHandlers } from "./dashboard.handlers";
import { worklistHandlers } from "./worklist.handlers";
import { referralsHandlers } from "./referrals.handlers";
import { consultationsHandlers } from "./consultations.handlers";
import { urgentInboxHandlers } from "./urgentInbox.handlers";

export const handlers = [
  ...dashboardHandlers,
  ...worklistHandlers,
  ...referralsHandlers,
  ...consultationsHandlers,
  ...urgentInboxHandlers,
];