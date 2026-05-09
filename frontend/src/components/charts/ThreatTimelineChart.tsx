"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function ThreatTimelineChart({
  data,
}: {
  data: { day: string; count: number }[];
}) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "#64748b", fontSize: 11, fontFamily: "var(--font-mono)" }}
            axisLine={{ stroke: "rgba(148,163,184,0.18)" }}
            tickLine={false}
            tickFormatter={(d) => d.slice(5)}
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
            cursor={{ stroke: "rgba(34,211,238,0.5)", strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#threatGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
