"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import type { CVEResult } from "@/types/api";

const SUGGESTIONS = ["log4j", "openssl", "kubernetes", "fortinet", "cisco asa", "exchange"];

function cvssBadge(s: number | null) {
  if (s == null) return ["text-slate-300 border-white/10", "—"];
  if (s >= 9) return ["text-rose-300 border-rose-300/40 bg-rose-300/5", s.toFixed(1)];
  if (s >= 7) return ["text-orange-300 border-orange-300/40 bg-orange-300/5", s.toFixed(1)];
  if (s >= 4) return ["text-amber-300 border-amber-300/40 bg-amber-300/5", s.toFixed(1)];
  return ["text-emerald-300 border-emerald-300/40 bg-emerald-300/5", s.toFixed(1)];
}

export default function CVEPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CVEResult[]>([]);

  async function search(value?: string) {
    const term = (value ?? q).trim();
    if (term.length < 2) return toast.error("At least 2 characters.");
    setLoading(true);
    try {
      const r = await api.cveSearch(term);
      setResults(r.results || []);
      if (!r.results?.length) toast.message("No CVEs found.");
    } catch {
      toast.error("CVE lookup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        icon={BookOpen}
        title="CVE Search"
        subtitle="Search the National Vulnerability Database. CVSS-aware. Live."
      />
      <Card>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              className="input pl-9"
              placeholder="e.g. log4j, openssl, kubernetes…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
            />
          </div>
          <Button onClick={() => search()} loading={loading} icon={<Search className="w-4 h-4" />}>
            Search NVD
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQ(s);
                search(s);
              }}
              className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-ink-900/70 border border-white/10 text-slate-300 hover:border-cyber-cyan/40 hover:text-white transition"
            >
              + {s}
            </button>
          ))}
        </div>
      </Card>

      {loading && <Skeleton className="h-[260px]" />}

      <div className="grid lg:grid-cols-2 gap-4">
        {results.map((c, i) => {
          const [cls, txt] = cvssBadge(c.cvss);
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Card>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-cyber-violet" />
                    <a
                      href={`https://nvd.nist.gov/vuln/detail/${c.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-sm text-cyber-cyan hover:underline"
                    >
                      {c.id}
                    </a>
                  </div>
                  <span className={`text-[11px] font-mono uppercase tracking-wider rounded-full border px-2.5 py-0.5 ${cls}`}>
                    CVSS {txt}
                  </span>
                </div>
                <p className="text-sm text-slate-300 line-clamp-5">{c.description}</p>
                <div className="mt-3 text-[11px] font-mono text-slate-500">
                  Published {c.published?.slice(0, 10)} · Updated {c.lastModified?.slice(0, 10)}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
