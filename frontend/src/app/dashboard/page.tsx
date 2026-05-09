"use client";
import { useEffect, useState } from "react";
import {
  Activity,
  ShieldAlert,
  Bug,
  FileSearch,
  Globe2,
  Sparkles,
  ScrollText,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/ui/Stat";
import { Card, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ThreatTimelineChart } from "@/components/charts/ThreatTimelineChart";
import { SeverityDonut } from "@/components/charts/SeverityDonut";
import { AttackTypeBars } from "@/components/charts/AttackTypeBars";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { LinkButton } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { DashboardStats } from "@/types/api";

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .dashboard()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Activity}
        title={`Welcome back${user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}.`}
        subtitle="Live operational picture across detections, intel and AI triage."
        action={
          <div className="flex gap-2">
            <LinkButton href="/dashboard/threats" variant="primary" icon={<ShieldAlert className="w-4 h-4" />}>
              New analysis
            </LinkButton>
            <LinkButton href="/dashboard/chat" variant="ghost" icon={<Sparkles className="w-4 h-4" />}>
              Ask Sentinel
            </LinkButton>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading || !stats ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[110px]" />)
        ) : (
          <>
            <StatCard label="Total threats" value={stats.total_threats} icon={ShieldAlert} accent="cyan" index={0} />
            <StatCard
              label="Critical"
              value={stats.critical_threats}
              icon={ShieldAlert}
              accent="rose"
              index={1}
              hint="HIGH+CRITICAL"
            />
            <StatCard label="Malware alerts" value={stats.malware_alerts} icon={Bug} accent="violet" index={2} />
            <StatCard label="Phishing flags" value={stats.phishing_attempts} icon={FileSearch} accent="amber" index={3} />
            <StatCard label="Blocked IPs" value={stats.blocked_ips} icon={Globe2} accent="green" index={4} />
            <StatCard
              label="Avg risk"
              value={`${stats.avg_risk_score.toFixed(1)}`}
              icon={TrendingUp}
              accent="cyan"
              index={5}
              hint="/ 100"
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader
              icon={Activity}
              title="Threat volume — last 7 days"
              subtitle="Detections per day across all logs and channels"
              action={
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-300">
                  Live
                </span>
              }
            />
            {loading || !stats ? (
              <Skeleton className="h-[240px]" />
            ) : (
              <ThreatTimelineChart data={stats.threats_by_day} />
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
          <Card>
            <CardHeader icon={ShieldAlert} title="Severity breakdown" subtitle="Composition across all analyses" />
            {loading || !stats ? (
              <Skeleton className="h-[220px]" />
            ) : (
              <SeverityDonut data={stats.severity_breakdown} />
            )}
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono text-slate-300 justify-center">
              {(stats?.severity_breakdown || []).map((s) => (
                <span key={s.severity} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: {
                        low: "#34d399",
                        medium: "#fbbf24",
                        high: "#fb923c",
                        critical: "#f43f5e",
                      }[s.severity as string],
                    }}
                  />
                  {s.severity} · {s.count}
                </span>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card>
            <CardHeader icon={Bug} title="Top attack types" />
            {loading || !stats ? (
              <Skeleton className="h-[220px]" />
            ) : stats.top_attack_types.length === 0 ? (
              <div className="h-[220px] grid place-items-center text-sm text-slate-400">
                No attacks recorded yet.
              </div>
            ) : (
              <AttackTypeBars data={stats.top_attack_types} />
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader
              icon={ScrollText}
              title="Recent activity"
              subtitle="Latest AI threat analyses across your tenant"
              action={
                <LinkButton href="/dashboard/threats" variant="ghost" className="!py-1.5 text-xs">
                  View all
                </LinkButton>
              }
            />
            {loading || !stats ? (
              <Skeleton className="h-[220px]" />
            ) : (
              <ActivityFeed items={stats.recent_activity} />
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
