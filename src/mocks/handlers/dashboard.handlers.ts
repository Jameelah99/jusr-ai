import { http, HttpResponse } from "msw";

import {
  referringClinicianDashboardMock,
  facilityAdministratorDashboardMock,
} from "../../features/dashboard/dashboard.mock";

import type {
  DashboardSummary,
  ReceivingClinicianDashboard,
  CareStage,
  PriorityCase,
  RecentActivityItem,
  IncomingReferral,
} from "../../features/dashboard/dashboard.types";

import {
  referralsMock,
  referralTimelineMock,
} from "../../features/referrals/referrals.mock";

import {
  getDemoWorklistState,
  getDemoTimelineEvents,
} from "../../features/worklist/demoState";

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return "No due date";

  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDay = new Date(due);
  dueDay.setHours(0, 0, 0, 0);

  const difference = Math.round(
    (dueDay.getTime() - today.getTime()) / 86400000,
  );

  if (difference < 0) {
    return `${Math.abs(difference)} days overdue`;
  }

  if (difference === 0) return "Due today";
  if (difference === 1) return "Due tomorrow";

  return `Due in ${difference} days`;
}

function getCoordinatorDashboard(facilityId: string): DashboardSummary {
  const facilityName =
    facilityId === "central-specialist"
      ? "Central Specialist Hospital"
      : "Demo Facility";

  const { cases: allCases } = getDemoWorklistState();

  const cases = allCases.filter((item) => item.facility === facilityName);

  const timelineEvents = getDemoTimelineEvents().filter((event) =>
    cases.some((item) => item.id === event.caseId),
  );

  const activeCases = cases.filter(
    (item) => !item.status.toLowerCase().includes("closed"),
  );

  const overdueCases = activeCases.filter((item) => {
    if (!item.dueDate) return false;

    const due = new Date(item.dueDate);
    due.setHours(23, 59, 59, 999);

    return due < new Date();
  });

  const priorityCases: PriorityCase[] = [...activeCases]
    .filter((item) => item.priority === "urgent" || item.priority === "high")
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      patientLabel: item.patientLabel,
      screeningResult: item.screeningResult,
      nextStep: item.nextAction,
      owner: item.assignedTo,
      dueLabel: formatDueDate(item.dueDate),
      priority: item.priority,
      status: item.status,
    }));

  const referrals = referralsMock;

  const referralOverview = {
    total: referrals.length,
    accepted: referrals.filter((item) => item.status === "accepted").length,
    pending: referrals.filter((item) => item.status === "pending").length,
    rejected: referrals.filter((item) => item.status === "rejected").length,
  };

  const careProgress: CareStage[] = [
    {
      label: "Patient notification",
      count: activeCases.filter(
        (item) =>
          !["Awaiting action", "Awaiting ownership"].includes(item.status),
      ).length,
      percentage: 0,
    },
    {
      label: "Confirmatory testing",
      count: activeCases.filter(
        (item) => item.status === "Confirmatory testing",
      ).length,
      percentage: 0,
    },
    {
      label: "Clinical consultation",
      count: activeCases.filter(
        (item) =>
          item.status.toLowerCase().includes("consultation") ||
          item.nextAction.toLowerCase().includes("clinical consultation"),
      ).length,
      percentage: 0,
    },
    {
      label: "Referral completion",
      count: referralOverview.accepted,
      percentage: 0,
    },
    {
      label: "Documented closure",
      count: cases.filter((item) =>
        item.status.toLowerCase().includes("closed"),
      ).length,
      percentage: 0,
    },
  ].map((stage) => ({
    ...stage,
    percentage:
      activeCases.length > 0
        ? Math.round((stage.count / activeCases.length) * 100)
        : 0,
  }));

  const activity: RecentActivityItem[] = [
    ...timelineEvents.map((event) => ({
      id: event.id,
      description: event.description,
      actor: event.actor,
      timestamp: event.timestamp,
    })),
    ...referralTimelineMock.map((event) => ({
      id: event.id,
      description: event.description,
      actor: event.actor,
      timestamp: event.timestamp,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 5)
    .map((event) => ({
      id: event.id,
      description: event.description,
      actor: event.actor,
      timestampLabel: new Date(event.timestamp).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

  return {
    stats: {
      activeCases: activeCases.length,
      urgentCases: activeCases.filter((item) => item.priority === "urgent")
        .length,
      overdueCases: overdueCases.length,
      unassignedCases: activeCases.filter((item) => !item.assignedTo).length,
    },
    priorityCases,
    careProgress,
    recentActivity: activity,
    referrals: referralOverview,
  };
}

export const dashboardHandlers = [
  http.get("/api/dashboard/summary", ({ request }) => {
    const url = new URL(request.url);
    const role = url.searchParams.get("role");

    switch (role) {
      case "coordinator": {
        const facilityId =
          url.searchParams.get("facilityId") ?? "demo-facility";

        return HttpResponse.json(getCoordinatorDashboard(facilityId));
      }

      case "referring_clinician":
        return HttpResponse.json(referringClinicianDashboardMock);

      case "receiving_clinician": {
        const incomingReferrals: IncomingReferral[] = referralsMock
          .filter(
            (referral) =>
              referral.receivingFacility === "Central Specialist Hospital",
          )
          .flatMap((referral) => {
            if (referral.status === "not_accepted_in_time") {
              return [];
            }

            const status: IncomingReferral["status"] = referral.status;

            return [
              {
                id: referral.id,
                patientLabel: referral.patientLabel,
                screeningType: referral.screeningType,
                priority: referral.priority,
                referringFacility: referral.referringFacility,
                referralReason: referral.referralReason,
                receivedAt: referral.createdAt,
                status,
              },
            ];
          });

        const dashboardData: ReceivingClinicianDashboard = {
          pendingReferrals: incomingReferrals.filter(
            (referral) => referral.status === "pending",
          ).length,

          acceptedReferrals: incomingReferrals.filter(
            (referral) => referral.status === "accepted",
          ).length,

          urgentReferrals: incomingReferrals.filter(
            (referral) =>
              referral.priority === "urgent" && referral.status === "pending",
          ).length,

          referrals: incomingReferrals.map((referral) => ({
            ...referral,
            receivedAt: new Date(referral.receivedAt).toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }),
          })),
        };

        return HttpResponse.json(dashboardData);
      }

      case "facility_administrator":
        return HttpResponse.json(facilityAdministratorDashboardMock);

      default:
        return HttpResponse.json(
          { message: "Invalid dashboard role." },
          { status: 400 },
        );
    }
  }),
];
