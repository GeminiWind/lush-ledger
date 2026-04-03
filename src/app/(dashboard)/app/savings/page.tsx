import { SavingsPageView } from "@/features/savings";
import { prisma } from "@/lib/db";
import { materializeRecurringTransactions } from "@/lib/recurring";
import { requireUser } from "@/lib/user";

type SearchParams = Promise<{ plan?: string | string[] | undefined; filter?: string | string[] | undefined }>;

export default async function SavingsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  await materializeRecurringTransactions(user.id);

  const language = user.settings?.language || "en-US";
  const currency = user.settings?.currency ?? "VND";

  const params = await searchParams;
  const requestedPlanId = Array.isArray(params.plan) ? params.plan[0] : params.plan;
  const requestedFilter = Array.isArray(params.filter) ? params.filter[0] : params.filter;
  const activeFilter =
    requestedFilter === "archived" || requestedFilter === "completed" || requestedFilter === "cancelled"
      ? requestedFilter
      : "active";

  const [savingsPlans, savingsTransactions, wallets] = await Promise.all([
    prisma.savingsPlan.findMany({
      where: { userId: user.id },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        icon: true,
        status: true,
        isPrimary: true,
        targetAmount: true,
        targetDate: true,
        createdAt: true,
        monthlyContribution: true,
      },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id, savingsPlanId: { not: null } },
      select: {
        amount: true,
        type: true,
        date: true,
        savingsPlanId: true,
      },
      orderBy: { date: "asc" },
    }),
    prisma.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <SavingsPageView
      language={language}
      currency={currency}
      activeFilter={activeFilter}
      requestedPlanId={requestedPlanId}
      savingsPlans={savingsPlans}
      savingsTransactions={savingsTransactions}
      wallets={wallets}
    />
  );
}
