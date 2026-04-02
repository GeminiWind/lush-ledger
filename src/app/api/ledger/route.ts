import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { dayOfMonth, fromISODate, toISODate } from "@/lib/date";
import { getLedgerData } from "@/lib/ledger";
import { ensureDefaultWallet } from "@/lib/wallet";

export const GET = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || undefined;
  const type = searchParams.get("type") || undefined;
  const accountId = searchParams.get("accountId") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;

  const ledger = await getLedgerData(session.sub, {
    query,
    type,
    accountId,
    categoryId,
  });

  return NextResponse.json({ ledger });
};

export const POST = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const requestedAccountId = String(body.accountId || "").trim();
  const categoryId = String(body.categoryId || "").trim();
  const savingsPlanId = String(body.savingsPlanId || "").trim();
  const type =
    body.type === "income"
      ? "income"
      : body.type === "transfer_to_saving_plan"
        ? "transfer_to_saving_plan"
        : "expense";
  const amount = Number(body.amount);
  const notes = String(body.notes || "").trim();
  const date = fromISODate(String(body.date || ""));
  const recurringEnabled = Boolean(body.recurring?.enabled);
  const recurringInterval = body.recurring?.interval === "yearly" ? "yearly" : "monthly";
  const recurringDayOfMonth = Number(body.recurring?.dayOfMonth || (date ? dayOfMonth(date) : Number.NaN));
  const recurringEndDateRaw = String(body.recurring?.endDate || "").trim();
  const recurringEndDate = recurringEndDateRaw ? fromISODate(recurringEndDateRaw) : null;

  if (Number.isNaN(amount) || amount <= 0 || !date) {
    return NextResponse.json(
      { error: "Amount and valid date are required." },
      { status: 400 }
    );
  }

  if (recurringEnabled && (!Number.isInteger(recurringDayOfMonth) || recurringDayOfMonth < 1 || recurringDayOfMonth > 31)) {
    return NextResponse.json({ error: "Recurring day must be between 1 and 31." }, { status: 400 });
  }

  if (recurringEnabled && recurringEndDate && recurringEndDate.getTime() < date.getTime()) {
    return NextResponse.json({ error: "Recurring end date must be on or after the transaction date." }, { status: 400 });
  }

  const account = requestedAccountId
    ? await prisma.account.findFirst({
        where: { id: requestedAccountId, userId: session.sub },
      })
    : await prisma.account.findFirst({
        where: { userId: session.sub },
        orderBy: { createdAt: "asc" },
      });

  const activeAccount = account || (await ensureDefaultWallet(session.sub));

  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: session.sub },
    });
    if (!category) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }
  }

  if (type === "transfer_to_saving_plan" && !savingsPlanId) {
    return NextResponse.json({ error: "Savings plan is required for transfer contributions." }, { status: 400 });
  }

  if (savingsPlanId && type !== "transfer_to_saving_plan") {
    return NextResponse.json(
      { error: "Savings plan contributions must use type transfer_to_saving_plan." },
      { status: 400 },
    );
  }

  if (savingsPlanId) {
    const savingsPlan = await prisma.savingsPlan.findFirst({
      where: { id: savingsPlanId, userId: session.sub, status: "active" },
      select: { id: true },
    });
    if (!savingsPlan) {
      return NextResponse.json({ error: "Invalid active savings plan." }, { status: 400 });
    }
  }

  if (requestedAccountId && !account) {
    return NextResponse.json({ error: "Invalid wallet." }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: session.sub,
      accountId: activeAccount.id,
      categoryId: categoryId || null,
      type,
      amount,
      date,
      notes: notes || null,
      savingsPlanId: savingsPlanId || null,
      isRecurringTemplate: recurringEnabled,
      recurringInterval: recurringEnabled ? recurringInterval : null,
      recurringDayOfMonth: recurringEnabled ? recurringDayOfMonth : null,
      recurringMonth: recurringEnabled && recurringInterval === "yearly" ? Number(toISODate(date).slice(5, 7)) : null,
      recurringStartDate: recurringEnabled ? date : null,
      recurringEndDate: recurringEnabled ? recurringEndDate : null,
      lastRecurringRunAt: recurringEnabled ? date : null,
    },
  });

  return NextResponse.json({ transaction }, { status: 201 });
};
