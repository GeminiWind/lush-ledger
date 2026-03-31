"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

type Props = {
  progress: number;
};

export default function PrimarySavingsProgressChart({ progress }: Props) {
  const safeProgress = Math.max(0, Math.min(progress, 100));
  const data = [{ name: "Progress", value: safeProgress }];

  return (
    <div className="relative h-56 w-56 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          data={data}
          innerRadius="78%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          barSize={16}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={16} fill="#006f1d" background={{ fill: "#d4ecf9" }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-[var(--font-manrope)] text-4xl font-extrabold text-[#1b3641]">{Math.round(safeProgress)}%</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#647e8c]">Complete</p>
        </div>
      </div>
    </div>
  );
}
