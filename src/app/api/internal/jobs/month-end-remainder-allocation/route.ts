import { NextRequest, NextResponse } from "next/server";
import { fromISODate, nowDate, startOfMonthDate } from "@/lib/date";
import { runScheduledMonthEndRemainderAllocation } from "@/lib/savings-remainder-allocation";
import { enqueueMonthEndAllocationJobs } from "@/lib/queue/producer";

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

const hasValidJobKey = (request: NextRequest) => {
  const configuredKey = process.env.INTERNAL_JOB_SECRET;
  if (!configuredKey) {
    return false;
  }

  return request.headers.get("x-internal-job-key") === configuredKey;
};

const isCronInvocation = (request: NextRequest) => {
  return request.headers.has("x-vercel-cron");
};

export const GET = async (request: NextRequest) => {
  const keyAuthorized = hasValidJobKey(request);
  const cronAuthorized = isCronInvocation(request);

  if (!keyAuthorized && !cronAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const monthRaw = request.nextUrl.searchParams.get("month");
  if (!monthRaw) {
    const result = await runScheduledMonthEndRemainderAllocation();
    return NextResponse.json(result);
  }

  const monthStart = normalizeMonthStart(monthRaw);
  if (!monthStart) {
    return NextResponse.json({ error: "month must be in YYYY-MM format." }, { status: 400 });
  }

  const result = await enqueueMonthEndAllocationJobs({
    monthStart,
    triggerSource: "cron",
  });

  return NextResponse.json(result);
};

export const POST = async () => {
  return NextResponse.json(
    { error: "Use /api/internal/jobs/month-end-remainder-allocation/replay for per-user replay." },
    { status: 405 },
  );
};
