"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartPoint = {
  key: string;
  label: string;
  expense: number;
  budget: number;
};

type Props = {
  data: ChartPoint[];
  currency: string;
};

const asCurrency = (value: number, currency: string) => {
  const locale = currency === "VND" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
};

export default function MonthlyExpenseBudgetChart({ data, currency }: Props) {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="#e7f6ff" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#7f97a4", fontSize: 11, fontWeight: 700 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#7f97a4", fontSize: 11 }}
            tickFormatter={(value: number) =>
              currency === "VND"
                ? `${Math.round(value / 1_000_000)}M`
                : `${Math.round(value / 1_000)}k`
            }
          />
          <Tooltip
            contentStyle={{ borderRadius: "0.75rem", borderColor: "#d8e8f3", fontSize: "12px" }}
            formatter={(value, name) => [asCurrency(Number(value ?? 0), currency), name === "expense" ? "Actual" : "Budget"]}
          />
          <Bar dataKey="budget" fill="#cfe6f2" radius={[10, 10, 0, 0]} />
          <Bar dataKey="expense" fill="#006f1d" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
