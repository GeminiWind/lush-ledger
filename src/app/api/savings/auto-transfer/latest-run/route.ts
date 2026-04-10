import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getLatestAutoTransferRun } from "@/lib/savings-auto-transfer";
import { startAutoTransferScheduler } from "@/lib/savings-auto-transfer-scheduler";

export const GET = async (request: NextRequest) => {
  startAutoTransferScheduler();

  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ errors: { auth: "Unauthorized" } }, { status: 401 });
  }

  const latestRun = await getLatestAutoTransferRun(session.sub);
  return NextResponse.json({ latestRun }, { status: 200 });
};
