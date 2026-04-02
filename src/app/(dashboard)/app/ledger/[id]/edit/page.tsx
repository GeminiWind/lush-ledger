import EditLedgerTransactionPageView from "@/features/ledger/components/edit/EditLedgerTransactionPageView";
import { toISODate } from "@/lib/date";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { notFound } from "next/navigation";

const splitNotes = (value: string | null) => {
  const raw = (value || "").trim();
  if (!raw) {
    return { description: "", note: "" };
  }

  const delimiter = " - ";
  const index = raw.indexOf(delimiter);
  if (index < 0) {
    return { description: raw, note: "" };
  }

  return {
    description: raw.slice(0, index).trim(),
    note: raw.slice(index + delimiter.length).trim(),
  };
};

type Params = {
  params: Promise<{ id: string }>;
};

export default async function EditLedgerTransactionPage({ params }: Params) {
  const user = await requireUser();
  const { id } = await params;

  const [transaction, categories] = await Promise.all([
    prisma.transaction.findFirst({
      where: { id, userId: user.id },
      select: {
        id: true,
        amount: true,
        categoryId: true,
        date: true,
        notes: true,
      },
    }),
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!transaction) {
    notFound();
  }

  const { description, note } = splitNotes(transaction.notes);

  return (
    <EditLedgerTransactionPageView
      transactionId={transaction.id}
      language={user.settings?.language || "en-US"}
      currency={user.settings?.currency ?? "VND"}
      categories={categories}
      initialAmount={Number(transaction.amount)}
      initialCategoryId={transaction.categoryId || ""}
      initialDate={toISODate(transaction.date)}
      initialDescription={description}
      initialNote={note}
    />
  );
}
