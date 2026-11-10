import { http, HttpResponse } from "msw";
import { referralResponseMock } from "../../features/referrals/referrals.mock";

export const referralsHandlers = [
  http.get("/api/referrals", () => {
    return HttpResponse.json(referralResponseMock);
  }),
];