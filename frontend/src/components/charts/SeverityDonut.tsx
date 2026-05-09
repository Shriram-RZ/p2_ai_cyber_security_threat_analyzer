"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS: Record<string, string> = {
  low: "#34d399",
  medium: "#fbbf24",
  high: "#fb923c",
  critical: "#f43f5e",
};

export function SeverityDonut({
  data,
}: {
  data: { severity: string; count: number }[];
}) {
  const total = data.reduce((a, b) => a + b.count, 0);
  const filtered = data.length ? data : [{ severity: "low", count: 1 }];
  return (
    <div className="relative h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filtered}
            dataKey="count"
            nameKey="severity"
            innerRadius={60}
            outerRadius={92}
            stroke="none"
            paddingAngle={2}
          >
            {filtered.map((entry, i) => (
              <Cell key={i} fill={COLORS[entry.severity] || "#64748b"} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgba(7,11,24,0.95)",
              border: "1px solid rgba(34,211,238,0.4)",
              borderRadius: 12,
              color: "#e2e8f0",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="text-center">
          <div className="text-[10px] uppercase font-mono tracking-[0.2em] text-slate-500">
            Total
          </div>
          <div className="text-2xl font-semibold text-white tabular-nums">{total}</div>
        </div>
      </div>
    </div>
  );
}
