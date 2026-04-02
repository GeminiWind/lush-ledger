"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useUserSetting } from "@/hooks/useUserSetting";

type GrowthPoint = {
  label: string;
  value: number;
};

type Props = {
  points: GrowthPoint[];
};

const toCurrencyLabel = (amount: number, currency: string) => {
  const locale = currency === "VND" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(amount);
};

export default function SavingsGrowthChart({ points }: Props) {
  const { currency } = useUserSetting();
  const [range, setRange] = useState<"6m" | "yearly">("yearly");

  const displayedPoints = useMemo(() => {
    if (range === "6m") {
      return points.slice(-6);
    }
    return points;
  }, [points, range]);

  return (
    <div className="rounded-[2rem] bg-white p-8 shadow-[0_4px_24px_rgba(27,54,65,0.04)]">
      <div className="mb-8 flex items-center justify-between gap-3">
        <h3 className="font-[var(--font-manrope)] text-xl font-bold text-[#1b3641]">Growth Velocity</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRange("6m")}
            className={`rounded-full px-4 py-1.5 text-[11px] font-bold transition-colors ${
              range === "6m" ? "bg-[#006f1d] text-[#eaffe2]" : "bg-[#e7f6ff] text-[#49636f] hover:bg-[#d4ecf9]"
            }`}
          >
            6 Months
          </button>
          <button
            type="button"
            onClick={() => setRange("yearly")}
            className={`rounded-full px-4 py-1.5 text-[11px] font-bold transition-colors ${
              range === "yearly" ? "bg-[#006f1d] text-[#eaffe2]" : "bg-[#e7f6ff] text-[#49636f] hover:bg-[#d4ecf9]"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayedPoints} margin={{ top: 12, right: 10, left: 0, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="#e7f6ff" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#647e8c", fontSize: 10, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#647e8c", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) =>
                currency === "VND"
                  ? `${Math.round(value / 1_000_000)}M`
                  : `${Math.round(value / 1_000)}k`
              }
            />
            <Tooltip
              cursor={{ fill: "#f3fbf6" }}
              formatter={(value) => toCurrencyLabel(Number(value ?? 0), currency)}
              contentStyle={{ borderRadius: "0.75rem", borderColor: "#d7e8f3", fontSize: "12px" }}
            />
            <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#006f1d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
