import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getAutoTransferRule, updateAutoTransferRule } from "@/lib/savings-auto-transfer";
import { startAutoTransferScheduler } from "@/lib/savings-auto-transfer-scheduler";

export const GET = async (request: NextRequest) => {
  startAutoTransferScheduler();

  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ errors: { auth: "Unauthorized" } }, { status: 401 });
  }

  const rule = await getAutoTransferRule(session.sub);
  return NextResponse.json(rule, { status: 200 });
};

export const PUT = async (request: NextRequest) => {
  startAutoTransferScheduler();

  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ errors: { auth: "Unauthorized" } }, { status: 401 });
  }

  const body = await request.json();
  const result = await updateAutoTransferRule(session.sub, {
    enabled: Boolean(body?.enabled),
    allocations: body?.allocations,
  });

  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  return NextResponse.json(result.data, { status: 200 });
};
