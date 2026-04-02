"use client";

import { asCurrency } from "./report-utils";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CashflowChartProps } from "@/features/ledger/types";

export default function CashflowChart({ rows, currency, title, incomeLabel, outcomeLabel }: CashflowChartProps) {
  return (
    <article className="rounded-[2rem] border border-[#dce9e2] bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-[var(--font-manrope)] text-xl font-bold text-[#1b3641]">{title}</h3>
        <div className="flex items-center gap-4 text-xs font-semibold text-[#647e8c]">
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#006f1d]" />{incomeLabel}</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#4d626c]" />{outcomeLabel}</span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 8, right: 0, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#006f1d" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#006f1d" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outcomeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4d626c" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#4d626c" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              formatter={(value) => asCurrency(Number(value ?? 0), currency)}
              contentStyle={{ borderRadius: "0.75rem", borderColor: "#d7e8f3", fontSize: "12px" }}
            />
            <Area type="monotone" dataKey="income" stroke="#006f1d" fill="url(#incomeFill)" strokeWidth={2.5} />
            <Area type="monotone" dataKey="outcome" stroke="#4d626c" fill="url(#outcomeFill)" strokeWidth={2.2} strokeDasharray="6 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
