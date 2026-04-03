import { CancelledSavingsPlansPageView } from "@/features/savings";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";

export default async function CancelledSavingsPlansPage() {
  const user = await requireUser();
  const language = user.settings?.language || "en-US";
  const currency = user.settings?.currency ?? "VND";

  const plans = await prisma.savingsPlan.findMany({
    where: { userId: user.id, status: "cancelled" },
    include: {
      transactions: {
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          amount: true,
          type: true,
          date: true,
          notes: true,
        },
      },
    },
    orderBy: [{ targetDate: "desc" }, { createdAt: "desc" }],
  });

  return (
    <CancelledSavingsPlansPageView
      language={language}
      currency={currency}
      plans={plans}
    />
  );
}
