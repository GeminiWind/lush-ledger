import { CancelledSavingsPlanDetailPageView } from "@/features/savings";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";

type Params = Promise<{ id: string }>;

export default async function CancelledSavingsPlanDetailPage({ params }: { params: Params }) {
  const user = await requireUser();
  const { id } = await params;
  const language = user.settings?.language || "en-US";
  const currency = user.settings?.currency ?? "VND";

  const plan = await prisma.savingsPlan.findFirst({
    where: { id, userId: user.id },
    include: {
      transactions: {
        include: {
          account: { select: { name: true } },
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!plan || plan.status !== "cancelled") {
    notFound();
  }

  return (
    <CancelledSavingsPlanDetailPageView
      language={language}
      currency={currency}
      plan={plan}
    />
  );
}
