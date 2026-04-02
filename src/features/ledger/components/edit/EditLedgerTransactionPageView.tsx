import EditTransactionForm from "@/features/ledger/components/edit/EditTransactionForm";
type Props = {
  transactionId: string;
  language: string;
  currency: string;
  categories: Array<{ id: string; name: string }>;
  initialAmount: number;
  initialCategoryId: string;
  initialDate: string;
  initialDescription: string;
  initialNote: string;
};

export default function EditLedgerTransactionPageView({
  transactionId,
  language,
  currency,
  categories,
  initialAmount,
  initialCategoryId,
  initialDate,
  initialDescription,
  initialNote,
}: Props) {

  return (
    <div className="relative min-h-[calc(100vh-180px)]">
      <div className="pointer-events-none absolute right-[-6%] top-[-25%] -z-10 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-emerald-100/50 to-transparent blur-[120px]" />

      <EditTransactionForm
        transactionId={transactionId}
        language={language}
        currency={currency}
        categories={categories}
        initialAmount={initialAmount}
        initialCategoryId={initialCategoryId}
        initialDate={initialDate}
        initialDescription={initialDescription}
        initialNote={initialNote}
      />
    </div>
  );
}
