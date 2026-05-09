"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { SeverityBadge } from "@/components/ui/Severity";
import { timeAgo } from "@/lib/utils";

export function ActivityFeed({
  items,
}: {
  items: { id: number; summary: string; severity: string; score: number; created_at: string }[];
}) {
  if (items.length === 0) {
    return (
      <div className="text-sm text-slate-400 py-12 text-center">
        No activity yet.{" "}
        <Link href="/dashboard/threats" className="text-cyber-cyan hover:underline">
          Run your first analysis →
        </Link>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-white/5">
      {items.map((it, i) => (
        <motion.li
          key={it.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: i * 0.04 }}
          className="py-3 flex items-start gap-3"
        >
          <SeverityBadge severity={it.severity} />
          <div className="min-w-0 flex-1">
            <Link
              href={`/dashboard/threats/${it.id}`}
              className="text-sm text-slate-100 hover:text-cyber-cyan line-clamp-1 block"
            >
              {it.summary || "Threat analysis"}
            </Link>
            <div className="text-[11px] font-mono text-slate-500 mt-1">
              risk {it.score?.toFixed?.(0) ?? it.score}/100 · {timeAgo(it.created_at)}
            </div>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
