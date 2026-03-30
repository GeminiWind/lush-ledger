"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartPoint = {
  key: string;
  label: string;
  income: number;
  expense: number;
};

type Props = {
  data: ChartPoint[];
  currency: string;
  incomeLabel: string;
  expenseLabel: string;
};

const asCurrency = (value: number, currency: string) => {
  const locale = currency === "VND" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
};

export default function MonthlyCashflowChart({ data, currency, incomeLabel, expenseLabel }: Props) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="#e7f6ff" vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#7f97a4", fontSize: 11, fontWeight: 700 }} />
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
            formatter={(value, name) => [asCurrency(Number(value ?? 0), currency), name === "income" ? incomeLabel : expenseLabel]}
            itemSorter={(item) => (item.dataKey === "income" ? -1 : 1)}
          />
          <Line type="monotone" dataKey="income" name={incomeLabel} stroke="#0f7a2f" strokeWidth={3} dot={{ r: 2.5 }} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="expense" name={expenseLabel} stroke="#a73b21" strokeWidth={3} dot={{ r: 2.5 }} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
