import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { ensureMonthlyCapSnapshot, monthStartOf } from "@/lib/monthly-cap";

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
  const userId = session.sub;

  const body = await request.json();
  const name = String(body.name || "").trim();
  const icon = String(body.icon || "category").trim() || "category";
  const monthlyLimit = Number(body.monthlyLimit || 0);
  const keepLimitNextMonth = body.keepLimitNextMonth !== false;
  const warningEnabled = body.warningEnabled !== false;
  const warnAt = Number(body.warnAt ?? 80);

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (!Number.isFinite(warnAt) || warnAt < 1 || warnAt > 100) {
    return NextResponse.json({ error: "Warn threshold must be between 1 and 100." }, { status: 400 });
  }

  const safeLimit = isNaN(monthlyLimit) ? 0 : monthlyLimit;
  const now = new Date();
  const monthStart = monthStartOf(now);
  const nextMonthStart = monthStartOf(new Date(now.getFullYear(), now.getMonth() + 1, 1));

  const category = await prisma.$transaction(async (tx) => {
    const created = await tx.category.create({
      data: {
        userId,
        name,
        icon,
      },
    });

    await tx.categoryMonthlyLimit.create({
      data: {
        userId,
        categoryId: created.id,
        monthStart,
        limit: safeLimit,
        warningEnabled,
        warnAt: Math.round(warnAt),
      },
    });

    await tx.categoryMonthlyLimit.upsert({
      where: {
        userId_categoryId_monthStart: {
          userId,
          categoryId: created.id,
          monthStart: nextMonthStart,
        },
      },
      create: {
        userId,
        categoryId: created.id,
        monthStart: nextMonthStart,
        limit: keepLimitNextMonth ? safeLimit : 0,
        warningEnabled,
        warnAt: Math.round(warnAt),
      },
      update: {
        limit: keepLimitNextMonth ? safeLimit : 0,
        warningEnabled,
        warnAt: Math.round(warnAt),
      },
    });

    return created;
  });

  await ensureMonthlyCapSnapshot(userId, new Date());

  return NextResponse.json({ category });
};
