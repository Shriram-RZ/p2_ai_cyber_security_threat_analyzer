"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ShieldOff, ShieldCheck, Globe2, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { SeverityBadge } from "@/components/ui/Severity";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import type { SuspiciousIP } from "@/types/api";

export default function IpsPage() {
  const [items, setItems] = useState<SuspiciousIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .ips()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  async function toggle(ip: SuspiciousIP) {
    try {
      if (ip.blocked) await api.unblockIp(ip.id);
      else await api.blockIp(ip.id);
      setItems((prev) =>
        prev.map((i) => (i.id === ip.id ? { ...i, blocked: !ip.blocked } : i)),
      );
      toast.success(`${ip.ip_address} ${ip.blocked ? "unblocked" : "blocked"}.`);
    } catch {
      toast.error("Action failed.");
    }
  }

  const filtered = query
    ? items.filter((i) =>
        `${i.ip_address} ${i.threat_type} ${i.country || ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : items;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Globe2}
        title="Suspicious IPs"
        subtitle="Hosts seen in your tenant logs. Block instantly to push to upstream WAF policies."
      />

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              className="input pl-9"
              placeholder="Search IP, country or threat type…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <span className="text-xs font-mono text-slate-500">
            {filtered.length} of {items.length}
          </span>
        </div>

        {loading ? (
          <Skeleton className="h-[400px]" />
        ) : filtered.length === 0 ? (
          <div className="text-sm text-slate-400 py-12 text-center">
            No suspicious IPs yet. Run a threat analysis to populate.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">
                <tr>
                  <th className="text-left px-2 py-2">IP</th>
                  <th className="text-left px-2 py-2">Threat</th>
                  <th className="text-left px-2 py-2">Severity</th>
                  <th className="text-left px-2 py-2">Hits</th>
                  <th className="text-left px-2 py-2">Last seen</th>
                  <th className="text-right px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ip, i) => (
                  <motion.tr
                    key={ip.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.02 }}
                    className="border-t border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="px-2 py-3 font-mono text-cyber-cyan">{ip.ip_address}</td>
                    <td className="px-2 py-3">
                      <div className="text-slate-200">{ip.threat_type}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {ip.country || "unknown"}
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <SeverityBadge severity={ip.severity} />
                    </td>
                    <td className="px-2 py-3 font-mono text-slate-300">{ip.occurrences}</td>
                    <td className="px-2 py-3 text-xs text-slate-400">{timeAgo(ip.last_seen)}</td>
                    <td className="px-2 py-3 text-right">
                      <Button
                        variant={ip.blocked ? "ghost" : "danger"}
                        onClick={() => toggle(ip)}
                        icon={ip.blocked ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                        className="!py-1.5 !px-3 text-xs"
                      >
                        {ip.blocked ? "Unblock" : "Block"}
                      </Button>
                    </td>
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
