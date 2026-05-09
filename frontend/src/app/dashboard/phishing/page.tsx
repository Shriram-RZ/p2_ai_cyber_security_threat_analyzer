"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileSearch, Sparkles, Link2, Mail, MessageCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RiskGauge } from "@/components/dashboard/RiskGauge";
import { Skeleton } from "@/components/ui/Skeleton";
import { api, ApiError } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import type { PhishingAnalysis } from "@/types/api";

const TYPES = [
  { value: "url", label: "URL", icon: Link2 },
  { value: "email", label: "Email", icon: Mail },
  { value: "message", label: "Message", icon: MessageCircle },
] as const;

const VERDICT_STYLES: Record<string, string> = {
  safe: "text-emerald-300 border-emerald-300/30 bg-emerald-300/5",
  suspicious: "text-amber-300 border-amber-300/30 bg-amber-300/5",
  phishing: "text-rose-300 border-rose-300/40 bg-rose-300/5",
  malicious: "text-rose-300 border-rose-300/40 bg-rose-300/5",
};

export default function PhishingPage() {
  const [type, setType] = useState<"url" | "email" | "message">("url");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhishingAnalysis | null>(null);
  const [history, setHistory] = useState<PhishingAnalysis[]>([]);

  useEffect(() => {
    api.phishingHistory().then(setHistory).catch(() => {});
  }, []);

  async function onScan() {
    if (!value.trim()) return toast.error("Enter a URL, email or message to scan.");
    setLoading(true);
    setResult(null);
    try {
      const r = await api.scanPhishing(type, value);
      setResult(r);
      const list = await api.phishingHistory();
      setHistory(list);
      toast.success(`Verdict: ${r.verdict.toUpperCase()}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Scan failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        icon={FileSearch}
        title="Phishing Detector"
        subtitle="AI inspects URLs, emails or pasted messages for credential harvesting and brand impersonation."
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader icon={Sparkles} title="Inspect a sample" />
          <div className="flex flex-wrap gap-2 mb-3">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs border transition ${
                  type === t.value
                    ? "border-cyber-cyan/50 bg-cyber-cyan/10 text-cyber-cyan"
                    : "border-white/10 text-slate-300 hover:border-cyber-cyan/30"
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>
          {type === "url" ? (
            <input
              className="input font-mono text-sm"
              placeholder="https://login.paypa1.com/verify?id=…"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : (
            <textarea
              className="textarea font-mono text-xs min-h-[180px]"
              placeholder={
                type === "email"
                  ? "Paste full email (headers + body)…"
                  : "Paste a suspicious message or chat snippet…"
              }
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          )}
          <div className="mt-3 flex items-center gap-2">
            <Button onClick={onScan} loading={loading} icon={<AlertTriangle className="w-4 h-4" />}>
              Scan with AI
            </Button>
            <button
              className="text-xs text-slate-400 hover:text-cyber-cyan font-mono"
              onClick={() =>
                setValue(
                  type === "url"
                    ? "https://account-secure-paypa1.com/verify?session=urgent-suspended"
                    : type === "email"
                      ? "From: it-support@micros0ft-help.com\nSubject: URGENT: Your account will be suspended in 24h\n\nClick here to verify: http://5.5.5.5/login.php"
                      : "Hey, your package is held at customs. Pay $1.99 fee here: http://dhl-track.zip/r",
                )
              }
            >
              ↳ insert sample
            </button>
          </div>
        </Card>

        <Card>
          <CardHeader icon={FileSearch} title="Recent scans" />
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">No scans yet.</p>
          ) : (
            <ul className="divide-y divide-white/5 max-h-[300px] overflow-y-auto">
              {history.slice(0, 10).map((h) => (
                <li key={h.id} className="py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-mono tracking-wider rounded-full border px-2 py-0.5 ${
                        VERDICT_STYLES[h.verdict] || "border-white/10 text-slate-300"
                      }`}
                    >
                      {h.verdict}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 ml-auto">
                      {timeAgo(h.created_at)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-300 truncate font-mono">
                    {h.input_value.slice(0, 80)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Skeleton className="h-[260px]" />
          </motion.div>
        )}
        {result && !loading && (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid lg:grid-cols-3 gap-4"
          >
            <Card>
              <CardHeader icon={AlertTriangle} title="Risk verdict" />
              <RiskGauge score={result.risk_score} label={result.verdict} />
              <div className="mt-3 grid place-items-center">
                <span
                  className={`text-[11px] uppercase font-mono tracking-wider rounded-full border px-3 py-1 ${
                    VERDICT_STYLES[result.verdict] || "border-white/10"
                  }`}
                >
                  {result.verdict}
                </span>
              </div>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader icon={Sparkles} title="Why" />
              <p className="text-sm text-slate-200 leading-relaxed">{result.explanation}</p>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                {(result.indicators || []).map((ind, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-ink-900/70 border border-white/5 p-3"
                  >
                    <div className="text-[10px] uppercase font-mono tracking-[0.2em] text-cyber-violet">
                      {ind.label}
                    </div>
                    <div className="mt-1 text-sm text-slate-200">{ind.detail}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-cyber-cyan/30 bg-cyber-cyan/5 p-3 text-sm text-slate-200">
                <span className="text-cyber-cyan font-mono text-[11px] uppercase tracking-[0.2em]">
                  Recommendation
                </span>
                <div className="mt-1">{result.recommendation}</div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
