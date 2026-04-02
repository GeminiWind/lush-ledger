"use client";

import { asCurrency } from "./report-utils";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryChartProps } from "@/features/ledger/types";

export default function CategoryChart({ rows, currency, title, totalLabel, noDataLabel }: CategoryChartProps) {
  const categoryTotal = rows.reduce((sum, item) => sum + item.value, 0);

  return (
    <article className="rounded-[2rem] border border-[#dce9e2] bg-white p-6 xl:col-span-4">
      <h3 className="text-center font-[var(--font-manrope)] text-xl font-bold text-[#1b3641]">{title}</h3>
      <div className="mt-4 h-56">
        {rows.length === 0 ? (
          <div className="grid h-full place-items-center rounded-2xl border border-dashed border-[#d6e5de] text-sm text-[#647e8c]">
            {noDataLabel}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={rows} dataKey="value" nameKey="name" innerRadius={52} outerRadius={84} paddingAngle={2}>
                {rows.map((row) => (
                  <Cell key={`${row.name}-${row.value}`} fill={row.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => asCurrency(Number(value ?? 0), currency)} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      {rows.length > 0 ? (
        <div className="mt-2 space-y-2">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#647e8c]">
            {totalLabel}: {asCurrency(categoryTotal, currency)}
          </p>
          {rows.slice(0, 5).map((row) => (
            <div key={`legend-${row.name}`} className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-2 font-medium text-[#1b3641]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                {row.name}
              </span>
              <span className="font-semibold text-[#49636f]">
                {categoryTotal > 0 ? `${((row.value / categoryTotal) * 100).toFixed(1)}%` : "0%"}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
