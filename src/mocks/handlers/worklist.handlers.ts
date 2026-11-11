import { http, HttpResponse } from "msw";
import { getDemoWorklistResponse } from "../../features/worklist/demoState";

export const worklistHandlers = [
  http.get("/api/worklist", () => {
    return HttpResponse.json(getDemoWorklistResponse());
  }),
];