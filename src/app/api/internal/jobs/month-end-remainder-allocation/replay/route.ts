import { NextRequest, NextResponse } from "next/server";
import { fromISODate, startOfMonthDate } from "@/lib/date";
import { enqueueUserMonthReplayJob } from "@/lib/queue/producer";

const hasValidJobKey = (request: NextRequest) => {
  const configuredKey = process.env.INTERNAL_JOB_SECRET;
  if (!configuredKey) {
    return false;
  }

  return request.headers.get("x-internal-job-key") === configuredKey;
};

const normalizeMonthStart = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const parsed = fromISODate(`${value}-01`);
  if (!parsed) {
    return null;
  }

  return startOfMonthDate(parsed);
};

export const POST = async (request: NextRequest) => {
  if (!hasValidJobKey(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  const monthRaw = typeof body.month === "string" ? body.month.trim() : "";
  const replayReason = typeof body.reason === "string" ? body.reason.trim() : undefined;

  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  const monthStart = normalizeMonthStart(monthRaw);
  if (!monthStart) {
    return NextResponse.json({ error: "month must be in YYYY-MM format." }, { status: 400 });
  }

  const result = await enqueueUserMonthReplayJob({
    userId,
    monthStart,
    reason: replayReason,
  });

  return NextResponse.json(result);
};
