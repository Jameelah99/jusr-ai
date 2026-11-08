
import { http, HttpResponse } from "msw";
import { worklistMock } from "../../features/worklist/worklist.mock";

export const worklistHandlers = [
  http.get("/api/worklist", () => {
    return HttpResponse.json(worklistMock);
  }),
];
