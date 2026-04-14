import { AtelierPageView } from "@/features/atelier";
import {
  createAtelierMonthOptions,
  mapAtelierListRows,
  monthParamFromDate,
  parseAtelierMonthParam,
} from "@/features/atelier/list-view-model";
import { prisma } from "@/lib/db";
import { getMonthRange, nowDate } from "@/lib/date";
import { materializeRecurringTransactions } from "@/lib/recurring";
import { serializeForClient } from "@/lib/serialize-for-client";
import { requireUser } from "@/lib/user";
import { ensureMonthlyCapSnapshot } from "@/lib/monthly-cap";
import { DateTime } from "luxon";

type SearchParams = Promise<{
  month?: string;
}>;

export default async function AtelierPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  const language = user.settings?.language || "en-US";
  const currency = user.settings?.currency || "VND";
  const timezone = user.settings?.timezone || "UTC";

  await materializeRecurringTransactions(user.id);

  const now = nowDate();
  const params = await searchParams;
  const parsedMonth = parseAtelierMonthParam(params.month, timezone);
  const fallbackMonthDate = DateTime.fromJSDate(now, { zone: timezone }).startOf("month");
  const selectedMonthDate = parsedMonth ?? fallbackMonthDate;
  const selectedMonth = monthParamFromDate(selectedMonthDate);

  const invalidMonth = Boolean(params.month) && !parsedMonth;

  const monthRangeDate = selectedMonthDate.toJSDate();
  const { start, end } = getMonthRange(monthRangeDate);
  const nextMonthStart = selectedMonthDate.plus({ months: 1 }).startOf("month").toJSDate();

  const monthOptions = createAtelierMonthOptions({
    currentMonth: fallbackMonthDate,
    selectedMonth: selectedMonthDate,
  });

  let listLoadError: string | null = null;

  let monthTransactions: Array<{
    type: string;
    amount: unknown;
    categoryId: string | null;
    savingsPlanId: string | null;
  }> = [];
  let monthlyCap: { totalCap: unknown; totalLimit: unknown } = {
    totalCap: 0,
    totalLimit: 0,
  };
  let listData = {
    month: selectedMonth,
    categories: [] as ReturnType<typeof mapAtelierListRows>,
  };

  try {
    const [categories, rawMonthTransactions, rawMonthlyCap, rawMonthLimits, rawNextMonthLimits] = await Promise.all([
      prisma.category.findMany({
        where: { userId: user.id },
        orderBy: [{ name: "asc" }, { id: "asc" }],
        select: {
          id: true,
          name: true,
          icon: true,
        },
      }),
      prisma.transaction.findMany({
        where: { userId: user.id, date: { gte: start, lte: end } },
        select: {
          type: true,
          amount: true,
          categoryId: true,
          savingsPlanId: true,
        },
      }),
      ensureMonthlyCapSnapshot(user.id, start, 0),
      prisma.categoryMonthlyLimit.findMany({
        where: { userId: user.id, monthStart: start },
        select: { categoryId: true, limit: true, warningEnabled: true, warnAt: true },
      }),
      prisma.categoryMonthlyLimit.findMany({
        where: { userId: user.id, monthStart: nextMonthStart },
        select: { categoryId: true, limit: true },
      }),
    ]);

    monthTransactions = serializeForClient(rawMonthTransactions) as Array<{
      type: string;
      amount: unknown;
      categoryId: string | null;
      savingsPlanId: string | null;
    }>;
    monthlyCap = serializeForClient(rawMonthlyCap) as { totalCap: unknown; totalLimit: unknown };
    const monthLimits = serializeForClient(rawMonthLimits) as Array<{
      categoryId: string;
      limit: unknown;
      warningEnabled: boolean;
      warnAt: number;
    }>;
    const nextMonthLimits = serializeForClient(rawNextMonthLimits) as Array<{
      categoryId: string;
      limit: unknown;
    }>;

    listData = {
      month: selectedMonth,
      categories: mapAtelierListRows({
        categories,
        monthTransactions,
        monthLimits,
        nextMonthLimits,
      }),
    };
  } catch {
    listLoadError = "Could not load atelier list.";
  }

  return (
    <AtelierPageView
      language={language}
      currency={currency}
      selectedMonth={selectedMonth}
      monthOptions={monthOptions}
      monthStart={start}
      monthlyCap={monthlyCap}
      monthTransactions={monthTransactions}
      listData={listData}
      monthValidationError={invalidMonth ? "month must be in YYYY-MM format" : null}
      listLoadError={listLoadError}
    />
  );
}
