import LedgerReportsPageView from "@/features/ledger/components/reports/LedgerReportsPageView";
import { getLedgerReportsData } from "@/lib/ledger";
import { requireUser } from "@/lib/user";

export default async function LedgerReportsPage() {
  const user = await requireUser();
  const language = user.settings?.language || "en-US";
  const currency = user.settings?.currency ?? "VND";
  const reportsData = await getLedgerReportsData(user.id);

  return (
    <LedgerReportsPageView
      language={language}
      currency={currency}
      reportsData={reportsData}
    />
  );
}
