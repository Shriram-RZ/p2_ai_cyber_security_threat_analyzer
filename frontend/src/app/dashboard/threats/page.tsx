"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Sparkles, Upload, Wand2, FileText } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { SeverityBadge } from "@/components/ui/Severity";
import { AnalysisResult } from "@/components/dashboard/AnalysisResult";
import { api, ApiError } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import type { ThreatAnalysis } from "@/types/api";

const LOG_TYPES = [
  "generic",
  "auth",
  "web_access",
  "firewall",
  "dns",
  "endpoint",
  "k8s",
  "cloudtrail",
];

const SAMPLE_LOGS: Record<string, string> = {
  "Brute-force SSH":
    `Mar 22 04:11:18 web-01 sshd[2934]: Failed password for invalid user admin from 198.51.100.42 port 50213 ssh2
Mar 22 04:11:21 web-01 sshd[2934]: Failed password for invalid user admin from 198.51.100.42 port 50213 ssh2
Mar 22 04:11:24 web-01 sshd[2934]: Failed password for invalid user admin from 198.51.100.42 port 50213 ssh2
Mar 22 04:11:27 web-01 sshd[2934]: Failed password for invalid user admin from 198.51.100.42 port 50213 ssh2
Mar 22 04:11:30 web-01 sshd[2934]: authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=198.51.100.42`,
  "SQL injection":
    `203.0.113.7 - - [22/Mar/2025:08:14:11 +0000] "GET /api/products?id=1' UNION SELECT username,password FROM users-- HTTP/1.1" 500 1283
203.0.113.7 - - [22/Mar/2025:08:14:13 +0000] "GET /api/products?id=1' OR '1'='1 HTTP/1.1" 200 9921`,
  "Reflected XSS":
    `172.16.7.13 - - [22/Mar/2025:09:01:55 +0000] "GET /search?q=<script>alert(document.cookie)</script> HTTP/1.1" 200 4421
172.16.7.13 - - [22/Mar/2025:09:01:58 +0000] "GET /profile?name=<img src=x onerror=alert(1)> HTTP/1.1" 200 3110`,
  "Suspicious PowerShell":
    `EventID=4104 ComputerName=fin-ws-12 ScriptBlock="powershell.exe -nop -w hidden -enc JABjAGwAaQBlAG4AdAA9AE4AZQB3AC0ATwBiAGoAZQBjAHQAIABTAHkAcwB0AGUAbQAuAE4AZQB0AC4AVwBlAGIAQwBsAGkAZQBuAHQA"
EventID=4688 NewProcess=C:\\\\Windows\\\\System32\\\\schtasks.exe CommandLine="schtasks /create /tn Updater /tr C:\\\\Users\\\\Public\\\\u.exe /sc minute /mo 5"`,
};

export default function ThreatAnalyzerPage() {
  const [content, setContent] = useState("");
  const [logType, setLogType] = useState("generic");
  const [filename, setFilename] = useState("paste.log");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ThreatAnalysis | null>(null);
  const [history, setHistory] = useState<ThreatAnalysis[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.listAnalyses().then(setHistory).catch(() => {});
  }, []);

  async function onAnalyze() {
    if (!content.trim()) return toast.error("Paste some log content first.");
    setAnalyzing(true);
    setResult(null);
    try {
      const r = await api.analyzeInline({ filename, log_type: logType, content });
      setResult(r);
      const list = await api.listAnalyses();
      setHistory(list);
      toast.success(`Analysis complete · severity ${r.severity.toUpperCase()}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200_000) {
      toast.error("File too large (max 200KB for direct paste).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setContent(String(reader.result || ""));
      setFilename(file.name);
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        icon={ShieldCheck}
        title="Threat Analyzer"
        subtitle="Paste raw logs or upload a file. Sentinel correlates events, maps to ATT&CK, and explains the attack chain."
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader icon={Wand2} title="New analysis" subtitle="JSON-mode AI · &lt; 3s typical" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <label className="block sm:col-span-2">
              <div className="text-[11px] uppercase font-mono tracking-[0.2em] text-slate-400 mb-1.5">
                Filename
              </div>
              <input
                className="input"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
              />
            </label>
            <label className="block">
              <div className="text-[11px] uppercase font-mono tracking-[0.2em] text-slate-400 mb-1.5">
                Log type
              </div>
              <select
                className="select"
                value={logType}
                onChange={(e) => setLogType(e.target.value)}
              >
                {LOG_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="relative">
            <textarea
              className="textarea font-mono text-xs min-h-[280px]"
              placeholder="Paste your raw log lines here…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {analyzing && (
              <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-cyber-cyan/5" />
                <motion.div
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent"
                  initial={{ y: 0 }}
                  animate={{ y: 280 }}
                  transition={{ duration: 1.6, ease: "linear", repeat: Infinity }}
                />
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-[11px] font-mono text-cyber-cyan">
                  <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
                  AI scanning · indexing IOCs · mapping ATT&CK…
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button onClick={onAnalyze} loading={analyzing} icon={<Sparkles className="w-4 h-4" />}>
              Analyze with AI
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".log,.txt,.csv,.json"
              hidden
              onChange={onFile}
            />
            <Button variant="ghost" onClick={() => fileRef.current?.click()} icon={<Upload className="w-4 h-4" />}>
              Upload file
            </Button>
            <div className="ml-auto flex flex-wrap gap-1.5">
              {Object.keys(SAMPLE_LOGS).map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    setContent(SAMPLE_LOGS[k]);
                    setFilename(`${k.toLowerCase().replace(/\s+/g, "-")}.log`);
                  }}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-ink-900/70 border border-white/10 text-slate-300 hover:border-cyber-cyan/40 hover:text-white transition"
                >
                  + {k}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader icon={FileText} title="Recent analyses" />
          {history.length === 0 ? (
            <p className="text-sm text-slate-400">Run your first analysis to see it here.</p>
          ) : (
            <ul className="divide-y divide-white/5 max-h-[420px] overflow-y-auto">
              {history.slice(0, 12).map((h) => (
                <li key={h.id} className="py-2.5 flex items-start gap-3">
                  <SeverityBadge severity={h.severity} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/threats/${h.id}`}
                      className="text-sm text-slate-100 hover:text-cyber-cyan line-clamp-1 block"
                    >
                      {h.summary || "Threat analysis"}
                    </Link>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      risk {h.score?.toFixed?.(0)}/100 · {timeAgo(h.created_at)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <AnalysisResult data={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
