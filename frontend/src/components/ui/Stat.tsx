"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  accent = "cyan",
  index = 0,
}: {
  label: string;
  value: number | string;
  delta?: string;
  hint?: string;
  icon?: React.ElementType;
  accent?: "cyan" | "violet" | "rose" | "amber" | "green";
  index?: number;
}) {
  const accentClass: Record<string, string> = {
    cyan: "from-cyber-cyan/30 to-transparent text-cyber-cyan",
    violet: "from-cyber-violet/30 to-transparent text-cyber-violet",
    rose: "from-cyber-rose/30 to-transparent text-cyber-rose",
    amber: "from-cyber-amber/30 to-transparent text-cyber-amber",
    green: "from-cyber-green/30 to-transparent text-cyber-green",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: "easeOut" }}
      className="panel panel-hover relative overflow-hidden p-5"
    >
      <div className={cn("absolute inset-x-0 -top-px h-px bg-gradient-to-r opacity-90", accentClass[accent])} />
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-mono">{label}</div>
          <div className="mt-2 text-[28px] leading-none font-semibold text-white tabular-nums">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={cn("rounded-xl p-2.5 border bg-gradient-to-br", accentClass[accent], "border-white/10")}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {(delta || hint) && (
        <div className="mt-3 flex items-center justify-between text-xs">
          {delta && <span className="text-emerald-300">{delta}</span>}
          {hint && <span className="text-slate-500 font-mono">{hint}</span>}
        </div>
      )}
    </motion.div>
  );
}
