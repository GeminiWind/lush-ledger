import { LedgerPageView } from "@/features/ledger";
import { getLedgerData } from "@/lib/ledger";
import { serializeForClient } from "@/lib/serialize-for-client";
import { requireUser } from "@/lib/user";

type SearchParams = Promise<{
  query?: string;
  type?: string;
  accountId?: string;
  categoryId?: string;
}>;

export default async function LedgerPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  const language = user.settings?.language || "en-US";
  const currency = user.settings?.currency ?? "VND";
  const params = await searchParams;

  const data = serializeForClient(await getLedgerData(user.id, {
    query: params.query,
    type: params.type,
    accountId: params.accountId,
    categoryId: params.categoryId,
  }));

  return (
    <LedgerPageView
      language={language}
      currency={currency}
      params={params}
      data={data}
    />
  );
}
