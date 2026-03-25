import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const amount = Number(body.amount);
  const categoryId = String(body.categoryId || "").trim();
  const notes = String(body.notes || "").trim();
  const date = new Date(String(body.date || ""));

  if (!Number.isFinite(amount) || amount <= 0 || Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Amount and valid date are required." }, { status: 400 });
  }

  const transaction = await prisma.transaction.findFirst({
    where: { id, userId: session.sub },
    select: { id: true },
  });

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
  }

  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: session.sub },
      select: { id: true },
    });
    if (!category) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }
  }

  const updated = await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      amount,
      categoryId: categoryId || null,
      notes: notes || null,
      date,
    },
  });

  return NextResponse.json({ transaction: updated });
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId: session.sub },
    select: { id: true },
  });

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
  }

  await prisma.transaction.delete({ where: { id: transaction.id } });

  return NextResponse.json({ ok: true });
};
