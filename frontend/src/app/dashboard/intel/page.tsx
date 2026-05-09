"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe2, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { SeverityBadge } from "@/components/ui/Severity";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";

interface Alert {
  id: string;
  title: string;
  severity: string;
  source: string;
  tags: string[];
  ts: string;
}

export default function IntelFeedPage() {
  const [data, setData] = useState<{ global_alerts: Alert[]; tenant_summary: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .intelFeed()
      .then((d) => setData(d as any))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Globe2}
        title="Threat Intelligence Feed"
        subtitle="Curated global alerts overlaid with your tenant context."
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Tenant pulse" subtitle="Last 24 hours" icon={Globe2} />
          {loading ? (
            <Skeleton className="h-[120px]" />
          ) : (
            <div className="flex items-baseline gap-3">
              <div className="text-5xl font-semibold text-gradient tabular-nums">
                {data?.tenant_summary?.high_severity_24h ?? 0}
              </div>
              <div className="text-xs text-slate-400">
                high-severity detections correlated with global activity
              </div>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Global alerts" subtitle="MITRE · CISA KEV · OSINT" />
          {loading ? (
            <Skeleton className="h-[360px]" />
          ) : (
            <ul className="divide-y divide-white/5">
              {(data?.global_alerts || []).map((a, i) => (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="py-3 flex items-start gap-3"
                >
                  <SeverityBadge severity={a.severity} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm text-white truncate">{a.title}</h4>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {a.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyber-violet/10 border border-cyber-violet/30 text-cyber-violet"
                        >
                          {t}
                        </span>
                      ))}
                      <span className="text-[10px] font-mono text-slate-500 ml-auto">
                        {a.source} · {timeAgo(a.ts)}
                      </span>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
