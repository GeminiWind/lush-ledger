import CategoryForm from "@/app/(app)/categories/CategoryForm";
import { prisma } from "@/lib/db";
import { getMonthRange } from "@/lib/date";
import { nowDate } from "@/lib/date";
import { formatCurrency } from "@/lib/format";
import { ensureMonthlyCapSnapshot } from "@/lib/monthly-cap";
import { requireUser } from "@/lib/user";

const toNumber = (value: unknown) => Number(value ?? 0);

export default async function CategoriesPage() {
  const user = await requireUser();
  const currency = user.settings?.currency || "VND";
  const { start, end } = getMonthRange(nowDate());
  await ensureMonthlyCapSnapshot(user.id, start);

  const [categories, transactions, monthLimits] = await Promise.all([
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id, date: { gte: start, lte: end } },
    }),
    prisma.categoryMonthlyLimit.findMany({
      where: { userId: user.id, monthStart: start },
      select: { categoryId: true, limit: true },
    }),
  ]);
  const monthLimitByCategoryId = new Map(monthLimits.map((item) => [item.categoryId, toNumber(item.limit)]));

  const rows = categories.map((category) => {
    const spent = transactions
      .filter((tx) => tx.categoryId === category.id && tx.type === "expense")
      .reduce((sum, tx) => sum + toNumber(tx.amount), 0);
    return {
      ...category,
      spent,
      limit: monthLimitByCategoryId.get(category.id) ?? 0,
    };
  });

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h1 className="text-lg font-semibold">Categories & limits</h1>
        <p className="text-sm text-slate-400">
          Create categories and set monthly spending limits.
        </p>
        <div className="mt-6">
          <CategoryForm />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h2 className="text-base font-semibold">Current limits</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          {rows.length === 0 ? (
            <p className="text-slate-500">No categories yet.</p>
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                className={`flex justify-between ${
                  row.spent > row.limit && row.limit > 0
                    ? "text-rose-200"
                    : "text-slate-200"
                }`}
              >
                <span>{row.name}</span>
                <span>
                  {formatCurrency(row.spent, currency)} /{" "}
                  {formatCurrency(row.limit, currency)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
