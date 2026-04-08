import { AtelierPageView } from "@/features/atelier";
import { prisma } from "@/lib/db";
import { getMonthRange, nowDate } from "@/lib/date";
import { materializeRecurringTransactions } from "@/lib/recurring";
import { serializeForClient } from "@/lib/serialize-for-client";
import { requireUser } from "@/lib/user";
import { ensureMonthlyCapSnapshot } from "@/lib/monthly-cap";
import {
  getSavingsRemainderAllocationSummary,
  getSavingsRemainderPrioritySettings,
} from "@/lib/savings-remainder-allocation";

export default async function AtelierPage() {
  const user = await requireUser();
  const language = user.settings?.language || "en-US";
  const currency = user.settings?.currency || "VND";

  await materializeRecurringTransactions(user.id);

  const now = nowDate();
  const { start, end } = getMonthRange(now);

  const [
    categories,
    rawMonthTransactions,
    rawSavingsPlans,
    rawMonthlyCap,
    rawMonthLimits,
    remainderAllocationSummary,
    monthlyPrioritySettings,
  ] = await Promise.all([
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
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
    prisma.savingsPlan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        isPrimary: true,
        monthlyContribution: true,
      },
    }),
    ensureMonthlyCapSnapshot(user.id, start, 0),
    prisma.categoryMonthlyLimit.findMany({
      where: { userId: user.id, monthStart: start },
      select: { categoryId: true, limit: true, warningEnabled: true, warnAt: true },
    }),
    getSavingsRemainderAllocationSummary(user.id, start),
    getSavingsRemainderPrioritySettings(user.id, start),
  ]);

  const monthTransactions = serializeForClient(rawMonthTransactions);
  const savingsPlans = serializeForClient(rawSavingsPlans);
  const monthlyCap = serializeForClient(rawMonthlyCap);
  const monthLimits = serializeForClient(rawMonthLimits);

  return (
    <AtelierPageView
      language={language}
      currency={currency}
      now={now}
      monthStart={start}
      categories={categories}
      monthTransactions={monthTransactions}
      savingsPlans={savingsPlans}
      monthlyCap={monthlyCap}
      monthLimits={monthLimits}
      remainderAllocationSummary={remainderAllocationSummary}
      monthlyPrioritySettings={monthlyPrioritySettings}
    />
  );
}
