import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { ensureMonthlyCapSnapshot } from "@/lib/monthly-cap";

export const GET = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ categories });
};

export const POST = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name || "").trim();
  const monthlyLimit = Number(body.monthlyLimit || 0);

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: {
      userId: session.sub,
      name,
      monthlyLimit: isNaN(monthlyLimit) ? 0 : monthlyLimit,
    },
  });

  await ensureMonthlyCapSnapshot(session.sub, new Date());

  return NextResponse.json({ category });
};
