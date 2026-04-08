import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { fromISODate, nowDate, startOfMonthDate } from "@/lib/date";
import {
  executeSavingsRemainderAllocation,
  getSavingsRemainderAllocationSummary,
} from "@/lib/savings-remainder-allocation";

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

  const month = request.nextUrl.searchParams.get("month");
  const monthStart = normalizeMonthStart(month);

  if (!monthStart) {
    return NextResponse.json({ error: "month must be in YYYY-MM format." }, { status: 400 });
  }

  const summary = await getSavingsRemainderAllocationSummary(session.sub, monthStart);
  return NextResponse.json(summary);
};

export const POST = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const monthInput = typeof body.month === "string" ? body.month.trim() : "";
  const monthStart = normalizeMonthStart(monthInput || null);

  if (!monthStart) {
    return NextResponse.json({ error: "month must be in YYYY-MM format." }, { status: 400 });
  }

  const result = await executeSavingsRemainderAllocation({
    userId: session.sub,
    monthStart,
    trigger: "manual",
  });

  return NextResponse.json(result);
};
