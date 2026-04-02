import { getDictionary } from "@/lib/i18n";
import { getLedgerReportsData } from "@/lib/ledger";
import { requireUser } from "@/lib/user";
import Link from "next/link";
import ReportsView from "./ReportsView";

export default async function LedgerReportsPage() {
  const user = await requireUser();
  const language = user.settings?.language || "en-US";
  const currency = user.settings?.currency ?? "VND";
  const t = getDictionary(language);
  const reportsData = await getLedgerReportsData(user.id);

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="flex items-center gap-8 border-b border-[#dce9e2] pb-2">
        <Link
          href="/app/ledger"
          className="pb-2 font-[var(--font-manrope)] text-lg font-semibold text-[#006f1d]/60 hover:text-[#1b3641]"
        >
          {t.ledgerTabActivity}
        </Link>
        <Link
          href="/app/ledger/reports"
          className="border-b-2 border-[#006f1d] pb-2 font-[var(--font-manrope)] text-lg font-semibold text-[#1b3641]"
        >
          {t.ledgerTabReports}
        </Link>
      </section>

      <ReportsView
        language={language}
        currency={currency}
        data={reportsData}
      />
    </div>
  );
}
