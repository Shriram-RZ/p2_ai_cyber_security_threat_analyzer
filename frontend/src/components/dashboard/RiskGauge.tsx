"use client";
import { motion } from "framer-motion";

export function RiskGauge({ score, label }: { score: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const angle = (clamped / 100) * 270 - 135; // arc from -135 to 135
  const color =
    clamped >= 80 ? "#f43f5e" : clamped >= 55 ? "#fb923c" : clamped >= 30 ? "#fbbf24" : "#34d399";

  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const arcLen = (clamped / 100) * (circ * 0.75); // 75% of full circle = 270deg

  return (
    <div className="relative w-[200px] h-[200px] mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-[135deg]">
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="rgba(148,163,184,0.18)"
          strokeWidth="14"
          fill="none"
          strokeDasharray={`${circ * 0.75} ${circ}`}
          strokeLinecap="round"
        />
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          stroke={color}
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${arcLen} ${circ}` }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-[10px] uppercase font-mono tracking-[0.22em] text-slate-500">
            {label || "Risk"}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-1 text-4xl font-semibold tabular-nums"
            style={{ color }}
          >
            {clamped}
          </motion.div>
          <div className="text-[10px] font-mono text-slate-500">/ 100</div>
        </div>
      </div>
    </div>
  );
}
