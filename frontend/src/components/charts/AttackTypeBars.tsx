"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const palette = ["#22d3ee", "#7c3aed", "#f472b6", "#34d399", "#fbbf24", "#fb7185"];

export function AttackTypeBars({ data }: { data: { type: string; count: number }[] }) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
          <XAxis
            dataKey="type"
            tick={{ fill: "#64748b", fontSize: 10, fontFamily: "var(--font-mono)" }}
            axisLine={{ stroke: "rgba(148,163,184,0.18)" }}
            tickLine={false}
            interval={0}
            angle={-15}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={{ stroke: "rgba(148,163,184,0.18)" }}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(7,11,24,0.95)",
              border: "1px solid rgba(34,211,238,0.4)",
              borderRadius: 12,
              color: "#e2e8f0",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
            cursor={{ fill: "rgba(34,211,238,0.06)" }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={palette[i % palette.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
