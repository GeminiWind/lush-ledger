import { LedgerReportsPageView } from "@/features/ledger";
import { getLedgerReportsData } from "@/lib/ledger";
import { serializeForClient } from "@/lib/serialize-for-client";
import { requireUser } from "@/lib/user";

export default async function LedgerReportsPage() {
  const user = await requireUser();
  const language = user.settings?.language || "en-US";
  const currency = user.settings?.currency ?? "VND";
  const reportsData = serializeForClient(await getLedgerReportsData(user.id));

  return (
    <LedgerReportsPageView
      language={language}
      currency={currency}
      reportsData={reportsData}
    />
  );
}
