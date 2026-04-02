"use client";

import { asCurrency } from "./report-utils";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Props = {
  rows: Array<{ label: string; expense: number; budget: number }>;
  currency: string;
  title: string;
  actualLabel: string;
  budgetLabel: string;
};

export default function ExpenseBudgetChart({ rows, currency, title, actualLabel, budgetLabel }: Props) {
  return (
    <article className="rounded-[2rem] border border-[#dce9e2] bg-white p-6 xl:col-span-8">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-[var(--font-manrope)] text-xl font-bold text-[#1b3641]">{title}</h3>
        <div className="flex items-center gap-4 text-xs font-semibold text-[#647e8c]">
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#006f1d]" />{actualLabel}</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#cbe7f6]" />{budgetLabel}</span>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 0, left: 0, bottom: 4 }}>
            <CartesianGrid stroke="#e7f2ea" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#647e8c", fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "#647e8c", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) =>
                currency === "VND" ? `${Math.round(value / 1_000_000)}M` : `${Math.round(value / 1_000)}k`
              }
            />
            <Tooltip
              cursor={{ fill: "rgba(215,232,243,0.35)" }}
              formatter={(value) => asCurrency(Number(value ?? 0), currency)}
              contentStyle={{ borderRadius: "0.75rem", borderColor: "#d7e8f3", fontSize: "12px" }}
            />
            <Bar dataKey="budget" radius={[8, 8, 0, 0]} fill="#cbe7f6" />
            <Bar dataKey="expense" radius={[8, 8, 0, 0]} fill="#006f1d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
