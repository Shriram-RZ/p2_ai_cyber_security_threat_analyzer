"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Network, Filter } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { SeverityBadge } from "@/components/ui/Severity";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { AttackEntry } from "@/types/api";

const ALL = "all";

export default function TimelinePage() {
  const [items, setItems] = useState<AttackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(ALL);

  useEffect(() => {
    api
      .attacks()
      .then((rows) =>
        setItems(rows.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))),
      )
      .finally(() => setLoading(false));
  }, []);

  const types = useMemo(() => {
    const set = new Set(items.map((i) => i.attack_type));
    return [ALL, ...Array.from(set)];
  }, [items]);

  const filtered = filter === ALL ? items : items.filter((i) => i.attack_type === filter);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Network}
        title="Attack Timeline"
        subtitle="Reconstruct adversary activity chronologically. Filter by attack type."
      />

      <Card>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Filter</span>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`text-[11px] font-mono px-2.5 py-1 rounded-full border transition ${
                filter === t
                  ? "border-cyber-cyan/50 bg-cyber-cyan/10 text-cyber-cyan"
                  : "border-white/10 text-slate-300 hover:border-cyber-cyan/30"
              }`}
            >
              {t}
            </button>
          ))}
          <span className="ml-auto text-[11px] font-mono text-slate-500">
            {filtered.length} events
          </span>
        </div>
      </Card>

      <Card padded={false}>
        {loading ? (
          <div className="p-5">
            <Skeleton className="h-[300px]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-slate-400 py-12 text-center">
            No attacks recorded for this filter.
          </div>
        ) : (
          <ol className="relative p-6">
            <span className="absolute left-[34px] top-6 bottom-6 w-px bg-gradient-to-b from-cyber-cyan/40 via-cyber-violet/30 to-cyber-rose/30" />
            {filtered.map((a, i) => (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.03 }}
                className="relative pl-14 pb-8 last:pb-0"
              >
                <span className="absolute left-6 top-1.5 grid place-items-center">
                  <span className="w-3 h-3 rounded-full bg-cyber-cyan ring-4 ring-cyber-cyan/15 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
                </span>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <SeverityBadge severity={a.severity} />
                  <span className="text-[11px] font-mono text-slate-500">
                    {formatDate(a.created_at)}
                  </span>
                  <span className="ml-auto text-[10px] uppercase font-mono tracking-wider text-cyber-violet bg-cyber-violet/10 border border-cyber-violet/30 rounded-full px-2 py-0.5">
                    {a.attack_type}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{a.title}</h3>
                {a.description && (
                  <p className="mt-1 text-sm text-slate-300">{a.description}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-mono text-slate-400">
                  {a.source_ip && (
                    <span>
                      <span className="text-slate-500">src</span>{" "}
                      <span className="text-cyber-cyan">{a.source_ip}</span>
                    </span>
                  )}
                  {a.target && (
                    <span>
                      <span className="text-slate-500">→ target</span> {a.target}
                    </span>
                  )}
                  {(a.indicators || []).slice(0, 3).map((i, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-ink-900/70 border border-white/10 px-2 py-0.5"
                    >
                      {i}
                    </span>
                  ))}
                </div>
              </motion.li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
