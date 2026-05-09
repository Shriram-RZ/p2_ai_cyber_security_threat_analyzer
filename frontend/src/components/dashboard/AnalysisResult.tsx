"use client";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Network,
  ListChecks,
  Sparkles,
  FileDown,
  Crosshair,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { SeverityBadge } from "@/components/ui/Severity";
import { RiskGauge } from "@/components/dashboard/RiskGauge";
import { LinkButton } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { ThreatAnalysis } from "@/types/api";

export function AnalysisResult({ data }: { data: ThreatAnalysis & { raw?: any } }) {
  const raw: any = (data as any).raw_response || (data as any).raw || {};
  const attack_chain: string[] = raw.attack_chain || [];
  const mitre: string[] = raw.mitre_tactics || [];

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="lg:col-span-1 space-y-4"
      >
        <Card>
          <CardHeader icon={ShieldAlert} title="Risk score" />
          <RiskGauge score={data.score} />
          <div className="mt-3 flex items-center justify-center gap-2">
            <SeverityBadge severity={data.severity} />
            <span className="text-[11px] font-mono text-slate-500">
              {(data.threats || []).length} threat(s) detected
            </span>
          </div>
        </Card>

        <Card>
          <CardHeader icon={ListChecks} title="Recommended mitigations" />
          {data.recommendations?.length ? (
            <ul className="space-y-2 text-sm text-slate-200">
              {data.recommendations.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-cyber-cyan mt-1">▸</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No recommendations.</p>
          )}
        </Card>

        <LinkButton
          href={api.reportPdfUrl(data.id)}
          variant="primary"
          icon={<FileDown className="w-4 h-4" />}
          className="w-full justify-center"
        >
          Download PDF report
        </LinkButton>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="lg:col-span-2 space-y-4"
      >
        <Card>
          <CardHeader icon={Sparkles} title="Executive summary" />
          <p className="text-sm text-slate-200 leading-relaxed">{data.summary}</p>
          {(attack_chain.length > 0 || mitre.length > 0) && (
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {attack_chain.length > 0 && (
                <div className="rounded-xl bg-ink-900/60 border border-white/5 p-3">
                  <div className="text-[10px] uppercase font-mono tracking-[0.2em] text-slate-500 mb-2">
                    Attack chain
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {attack_chain.map((p, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-cyber-cyan rounded-full bg-cyber-cyan/10 border border-cyber-cyan/25 px-2 py-0.5"
                      >
                        {i > 0 && <span className="text-slate-500">→</span>} {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {mitre.length > 0 && (
                <div className="rounded-xl bg-ink-900/60 border border-white/5 p-3">
                  <div className="text-[10px] uppercase font-mono tracking-[0.2em] text-slate-500 mb-2">
                    MITRE ATT&CK
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {mitre.map((m, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono text-cyber-violet rounded-full bg-cyber-violet/10 border border-cyber-violet/30 px-2 py-0.5"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader icon={Crosshair} title={`Detected threats · ${(data.threats || []).length}`} />
          <div className="space-y-3">
            {(data.threats || []).map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-xl bg-ink-900/70 border border-white/5 p-4 hover:border-cyber-cyan/30 transition"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={t.severity} />
                      <h4 className="text-sm font-semibold text-white">{t.title}</h4>
                    </div>
                    <p className="mt-1.5 text-sm text-slate-300">{t.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-mono text-slate-500">Confidence</div>
                    <div className="text-cyber-cyan font-mono text-sm">{t.confidence}%</div>
                  </div>
                </div>
                <div className="mt-3 grid sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-400">
                  <div>
                    <span className="text-slate-500">Type</span>
                    <div className="text-slate-200">{t.type}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Source IP</span>
                    <div className="text-slate-200">{t.source_ip || "—"}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Indicators</span>
                    <div className="text-slate-200 break-all">
                      {(t.indicators || []).slice(0, 3).join(", ") || "—"}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {(data.threats || []).length === 0 && (
              <p className="text-sm text-slate-400">No threats detected by the engine.</p>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
