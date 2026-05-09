"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ScrollText, Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { SeverityBadge } from "@/components/ui/Severity";
import { api } from "@/lib/api";
import { timeAgo, cn } from "@/lib/utils";
import type { Incident } from "@/types/api";

const STATUS_COLOR: Record<string, string> = {
  open: "text-rose-300 border-rose-300/40 bg-rose-300/5",
  investigating: "text-amber-300 border-amber-300/30 bg-amber-300/5",
  contained: "text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/5",
  closed: "text-emerald-300 border-emerald-300/30 bg-emerald-300/5",
};

export default function IncidentsPage() {
  const [items, setItems] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    summary: "",
    severity: "medium",
    status: "open",
  });

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      setItems(await api.incidents());
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    if (!draft.title.trim()) return toast.error("Title required.");
    try {
      await api.createIncident(draft);
      toast.success("Incident logged.");
      setDraft({ title: "", summary: "", severity: "medium", status: "open" });
      setShowForm(false);
      refresh();
    } catch {
      toast.error("Failed.");
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        icon={ScrollText}
        title="Incident Reports"
        subtitle="Track investigations end-to-end. Severity, timeline, mitigation."
        action={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "New incident"}
          </Button>
        }
      />

      {showForm && (
        <Card>
          <CardHeader title="New incident" />
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block sm:col-span-2">
              <div className="text-[11px] uppercase font-mono tracking-[0.2em] text-slate-400 mb-1.5">
                Title
              </div>
              <input
                className="input"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Suspicious privileged access on prod-db-01"
              />
            </label>
            <label className="block">
              <div className="text-[11px] uppercase font-mono tracking-[0.2em] text-slate-400 mb-1.5">
                Severity
              </div>
              <select
                className="select"
                value={draft.severity}
                onChange={(e) => setDraft({ ...draft, severity: e.target.value })}
              >
                {["low", "medium", "high", "critical"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <div className="text-[11px] uppercase font-mono tracking-[0.2em] text-slate-400 mb-1.5">
                Status
              </div>
              <select
                className="select"
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
              >
                {["open", "investigating", "contained", "closed"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <div className="text-[11px] uppercase font-mono tracking-[0.2em] text-slate-400 mb-1.5">
                Summary
              </div>
              <textarea
                className="textarea min-h-[120px]"
                value={draft.summary}
                onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={create}>Log incident</Button>
          </div>
        </Card>
      )}

      <Card>
        {loading ? (
          <Skeleton className="h-[300px]" />
        ) : items.length === 0 ? (
          <div className="text-sm text-slate-400 py-12 text-center">No incidents yet.</div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">
                <tr>
                  <th className="text-left px-2 py-2">Title</th>
                  <th className="text-left px-2 py-2">Severity</th>
                  <th className="text-left px-2 py-2">Status</th>
                  <th className="text-left px-2 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <motion.tr
                    key={it.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-t border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="px-2 py-3">
                      <div className="text-slate-100 font-medium">{it.title}</div>
                      <div className="text-xs text-slate-400 line-clamp-1">{it.summary}</div>
                    </td>
                    <td className="px-2 py-3">
                      <SeverityBadge severity={it.severity} />
                    </td>
                    <td className="px-2 py-3">
                      <span
                        className={cn(
                          "text-[11px] font-mono uppercase tracking-wider rounded-full border px-2 py-0.5",
                          STATUS_COLOR[it.status] || "border-white/10 text-slate-300",
                        )}
                      >
                        {it.status}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-xs text-slate-400">{timeAgo(it.created_at)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
