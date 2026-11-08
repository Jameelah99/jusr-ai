
import { http, HttpResponse } from "msw";

import { dashboardMock } from "../../features/dashboard/dashboard.mock";

export const dashboardHandlers = [
  http.get("/api/dashboard/summary", () => {
    return HttpResponse.json(dashboardMock);
  }),
];
