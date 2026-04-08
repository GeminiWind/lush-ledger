import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { fromISODate, nowDate, startOfMonthDate } from "@/lib/date";
import {
  addDefaultPrimarySavingsRemainderSetting,
  getSavingsRemainderPrioritySettings,
  replaceSavingsRemainderPrioritySettings,
} from "@/lib/savings-remainder-allocation";
import { prisma } from "@/lib/db";

const normalizeMonthStart = (value: string | null | undefined) => {
  if (!value) {
    return startOfMonthDate(nowDate());
  }

  const parsed = fromISODate(`${value}-01`);
  if (!parsed) {
    return null;
  }

  return startOfMonthDate(parsed);
};

export const GET = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const monthStart = normalizeMonthStart(request.nextUrl.searchParams.get("month"));
  if (!monthStart) {
    return NextResponse.json({ error: "month must be in YYYY-MM format." }, { status: 400 });
  }

  const settings = await getSavingsRemainderPrioritySettings(session.sub, monthStart);
  return NextResponse.json({ settings });
};

export const PUT = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const monthRaw = typeof body.month === "string" ? body.month.trim() : "";
  const monthStart = normalizeMonthStart(monthRaw || null);
  if (!monthStart) {
    return NextResponse.json({ error: "month must be in YYYY-MM format." }, { status: 400 });
  }

  const settings = Array.isArray(body.settings) ? (body.settings as unknown[]) : null;
  if (!settings) {
    return NextResponse.json({ error: "settings must be an array." }, { status: 400 });
  }

  const sanitized = settings
    .map((item) => {
      const candidate = item as { savingsPlanId?: unknown; priorityPercent?: unknown };
      return {
        savingsPlanId: typeof candidate.savingsPlanId === "string" ? candidate.savingsPlanId : "",
        priorityPercent: Number(candidate.priorityPercent ?? 0),
      };
    })
    .filter(
      (item): item is { savingsPlanId: string; priorityPercent: number } =>
        Boolean(item.savingsPlanId) && Number.isFinite(item.priorityPercent) && item.priorityPercent > 0,
    );

  const uniquePlanIds = Array.from(new Set(sanitized.map((item) => item.savingsPlanId)));
  if (uniquePlanIds.length !== sanitized.length) {
    return NextResponse.json({ error: "settings cannot contain duplicate plans." }, { status: 400 });
  }

  if (uniquePlanIds.length > 0) {
    const validPlans = await prisma.savingsPlan.findMany({
      where: {
        userId: session.sub,
        id: { in: uniquePlanIds },
        status: { in: ["active", "funded"] },
      },
      select: { id: true },
    });
    const validIds = new Set(validPlans.map((item) => item.id));

    if (uniquePlanIds.some((id) => !validIds.has(id))) {
      return NextResponse.json({ error: "settings contain non-eligible savings plans." }, { status: 400 });
    }
  }

  const replaced = await replaceSavingsRemainderPrioritySettings({
    userId: session.sub,
    monthStart,
    settings: sanitized,
  });

  return NextResponse.json({ settings: replaced });
};

export const POST = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const monthRaw = typeof body.month === "string" ? body.month.trim() : "";
  const monthStart = normalizeMonthStart(monthRaw || null);
  if (!monthStart) {
    return NextResponse.json({ error: "month must be in YYYY-MM format." }, { status: 400 });
  }

  const settings = await addDefaultPrimarySavingsRemainderSetting({
    userId: session.sub,
    monthStart,
  });

  return NextResponse.json({ settings });
};
