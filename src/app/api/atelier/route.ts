import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getAtelierListData } from "@/lib/atelier";
import { parseMonthQuery } from "@/lib/date";

export const GET = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ errors: { auth: "Unauthorized" } }, { status: 401 });
  }

  const parsedMonth = parseMonthQuery(request.nextUrl.searchParams.get("month"));
  if (!parsedMonth.ok) {
    return NextResponse.json({ errors: parsedMonth.errors }, { status: 400 });
  }

  try {
    const atelier = await getAtelierListData(session.sub, { month: parsedMonth.month });
    return NextResponse.json(atelier);
  } catch {
    return NextResponse.json({ errors: { server: "Failed to load atelier list" } }, { status: 500 });
  }
};
