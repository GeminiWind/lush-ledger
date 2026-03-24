"use client";

import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type TopCategory = {
  id: string;
  name: string;
  spent: number;
};

type Props = {
  categories: TopCategory[];
  currency: string;
};

const toCurrencyLabel = (amount: number, currency: string) => {
  const locale = currency === "VND" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(amount);
};

const getCategoryIcon = (name: string) => {
  const normalized = name.toLowerCase();

  if (/(dining|food|restaurant|cafe|drink|beverage)/.test(normalized)) {
    return "restaurant";
  }
  if (/(rent|estate|home|housing|mortgage|property)/.test(normalized)) {
    return "home";
  }
  if (/(apparel|fashion|shopping|goods|clothes)/.test(normalized)) {
    return "shopping_bag";
  }
  if (/(travel|flight|hotel|trip|vacation)/.test(normalized)) {
    return "flight";
  }
  if (/(transport|car|fuel|taxi|ride)/.test(normalized)) {
    return "directions_car";
  }

  return "category";
};

const chartColors = ["#006f1d", "#4caf50", "#7bc67e", "#a9ddac", "#cfeccf"];

export default function TopCategoriesPanel({ categories, currency }: Props) {
  const [showChart, setShowChart] = useState(false);

  const topValue = categories[0]?.spent ?? 0;
  const hasCategories = categories.length > 0;

  const chartData = useMemo(() => {
    const total = categories.reduce((sum, category) => sum + category.spent, 0);
    if (total <= 0) {
      return [];
    }

    return categories.map((category, index) => {
      const percent = (category.spent / total) * 100;
      return {
        ...category,
        percent,
        color: chartColors[index % chartColors.length],
      };
    });
  }, [categories]);

  return (
    <article className="rounded-2xl border border-[#f0f4f8] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between">
        <h2 className="font-[var(--font-manrope)] text-xl font-bold">Top Categories</h2>
        <button
          type="button"
          onClick={() => setShowChart((state) => !state)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#006f1d] hover:text-[#04551b]"
        >
          <span className="material-symbols-outlined text-sm">pie_chart</span>
          {showChart ? "Show List" : "Show Chart"}
        </button>
      </div>

      <div className="mt-5">
        {!hasCategories ? (
          <p className="text-sm text-[#647e8c]">No category spending yet.</p>
        ) : showChart ? (
          <div className="space-y-4">
            <div className="mx-auto h-44 w-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="spent"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => toCurrencyLabel(Number(value ?? 0), currency)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="-mt-24 grid place-items-center text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#647e8c]">Total</p>
                <p className="font-[var(--font-manrope)] text-sm font-bold text-[#1b3641]">
                  {toCurrencyLabel(chartData.reduce((sum, item) => sum + item.spent, 0), currency)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {chartData.map((category) => (
                <div key={category.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="font-medium text-[#1b3641]">{category.name}</span>
                  </div>
                  <span className="font-semibold text-[#49636f]">{category.percent.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => {
              const spendAgainstTop = topValue > 0 ? (category.spent / topValue) * 100 : 0;

              return (
                <div key={category.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f4f8] text-[#49636f]">
                    <span className="material-symbols-outlined text-base">{getCategoryIcon(category.name)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-sm font-semibold text-[#1b3641]">
                      <p className="truncate">{category.name}</p>
                      <p>{toCurrencyLabel(category.spent, currency)}</p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#edf2ef]">
                      <div className="h-full rounded-full bg-[#006f1d]" style={{ width: `${Math.min(100, spendAgainstTop)}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}
