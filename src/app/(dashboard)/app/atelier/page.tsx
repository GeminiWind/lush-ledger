import { AtelierPageView } from "@/features/atelier";
import { prisma } from "@/lib/db";
import { getMonthRange, nowDate } from "@/lib/date";
import { materializeRecurringTransactions } from "@/lib/recurring";
import { requireUser } from "@/lib/user";
import { ensureMonthlyCapSnapshot } from "@/lib/monthly-cap";

export default async function AtelierPage() {
  const user = await requireUser();
  const language = user.settings?.language || "en-US";
  const currency = user.settings?.currency || "VND";

  await materializeRecurringTransactions(user.id);

  const now = nowDate();
  const { start, end } = getMonthRange(now);

  const [categories, monthTransactions, savingsPlans, monthlyCap, monthLimits] = await Promise.all([
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
        monthlyContribution: true,
      },
    }),
    ensureMonthlyCapSnapshot(user.id, start, 0),
    prisma.categoryMonthlyLimit.findMany({
      where: { userId: user.id, monthStart: start },
      select: { categoryId: true, limit: true, warningEnabled: true, warnAt: true },
    }),
  ]);

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
    />
  );
}
