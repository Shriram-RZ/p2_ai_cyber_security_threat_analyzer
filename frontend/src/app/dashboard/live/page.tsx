"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Pause, Play, Trash2, Radio } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SeverityBadge } from "@/components/ui/Severity";

interface Event {
  id: number;
  ts: string;
  type: string;
  title: string;
  severity: string;
  source_ip: string;
  country: string;
  target: string;
}

export default function LivePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [paused, setPaused] = useState(false);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (paused) {
      esRef.current?.close();
      setConnected(false);
      return;
    }
    const es = new EventSource("/api/live", { withCredentials: true });
    esRef.current = es;
    es.addEventListener("hello", () => setConnected(true));
    es.addEventListener("threat", (e: MessageEvent) => {
      try {
        const ev = JSON.parse(e.data) as Event;
        setEvents((prev) => [ev, ...prev].slice(0, 80));
      } catch {}
    });
    es.onerror = () => setConnected(false);
    return () => {
      es.close();
    };
  }, [paused]);

  const counts = events.reduce(
    (acc, e) => {
      acc[e.severity] = (acc[e.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Activity}
        title="Live Monitor"
        subtitle="Real-time stream of simulated cyber events. Pause, clear, and triage with AI."
        action={
          <div className="flex gap-2">
            <Button
              variant="ghost"
              icon={paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? "Resume" : "Pause"}
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => setEvents([])}
            >
              Clear
            </Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-4 gap-4">
        <StatTile label="Stream" value={connected ? "ACTIVE" : paused ? "PAUSED" : "RECONNECTING"} accent={connected ? "emerald" : "amber"} />
        <StatTile label="Critical" value={counts.critical || 0} accent="rose" />
        <StatTile label="High" value={counts.high || 0} accent="orange" />
        <StatTile label="Total seen" value={events.length} accent="cyan" />
      </div>

      <Card padded={false}>
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
          <Radio className={`w-4 h-4 ${connected ? "text-emerald-300 animate-pulse" : "text-slate-500"}`} />
          <div className="text-sm font-semibold">SOC live tap</div>
          <div className="ml-auto text-[10px] font-mono text-slate-500">
            edge:us-east · ai:gemini-flash · evt-bus:nats
          </div>
        </div>
        <div className="terminal scanline relative h-[520px] overflow-hidden">
          <div className="absolute inset-0 overflow-y-auto p-4 text-[12px] font-mono">
            <AnimatePresence initial={false}>
              {events.map((e) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-[80px_140px_1fr_auto] gap-3 items-center py-1.5 border-b border-white/5 last:border-0"
                >
                  <span className="text-slate-500">{e.ts.slice(11, 19)}</span>
                  <span className="text-cyber-cyan truncate">{e.source_ip}</span>
                  <span className="text-slate-200 truncate">
                    <span className="text-slate-500">[{e.country}→{e.target}]</span> {e.title}
                  </span>
                  <SeverityBadge severity={e.severity} />
                </motion.div>
              ))}
            </AnimatePresence>
            {events.length === 0 && (
              <div className="text-slate-500 text-center py-12">
                {paused
                  ? "Stream paused. Click resume to continue."
                  : "Waiting for events…"}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent = "cyan",
}: {
  label: string;
  value: string | number;
  accent?: "cyan" | "rose" | "amber" | "orange" | "emerald";
}) {
  const colors: Record<string, string> = {
    cyan: "text-cyber-cyan",
    rose: "text-rose-300",
    amber: "text-amber-300",
    orange: "text-orange-300",
    emerald: "text-emerald-300",
  };
  return (
    <div className="panel panel-hover p-4">
      <div className="text-[10px] uppercase font-mono tracking-[0.2em] text-slate-500">
        {label}
      </div>
      <div className={`mt-2 text-2xl font-semibold tabular-nums ${colors[accent]}`}>{value}</div>
    </div>
  );
}
