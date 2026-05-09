"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Terminal, Activity, Cpu, Network } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="relative pt-20 pb-24 sm:pt-28 sm:pb-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyber-cyan/30 bg-cyber-cyan/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] font-mono text-cyber-cyan"
          >
            <Sparkles className="w-3.5 h-3.5" />
            v1.0 · AI-native Cyber Defense
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-5 text-4xl sm:text-5xl lg:text-[60px] leading-[1.05] font-semibold tracking-tight text-white"
          >
            The AI co-pilot for{" "}
            <span className="text-gradient">modern cyber operations</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed"
          >
            Sentinel AI ingests your logs, hunts adversaries, explains attacks,
            scores risk and automates response — so your SOC can think in
            seconds, not hours.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <LinkButton href="/signup" icon={<ShieldCheck className="w-4 h-4" />}>
              Start defending free
            </LinkButton>
            <Link
              href="#workflow"
              className="btn-ghost"
            >
              See how it works <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl"
          >
            {[
              { Icon: Activity, label: "12.4M events / hr" },
              { Icon: Cpu, label: "AI triage in 1.8s" },
              { Icon: Network, label: "300+ ATT&CK rules" },
              { Icon: Terminal, label: "JSON-mode AI" },
            ].map(({ Icon, label }, i) => (
              <div
                key={i}
                className="glass rounded-xl px-3 py-2.5 flex items-center gap-2 text-xs text-slate-300"
              >
                <Icon className="w-4 h-4 text-cyber-cyan" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>

        <div className="lg:col-span-5">
          <HeroPanel />
        </div>
      </div>
    </section>
  );
}

function HeroPanel() {
  const items = [
    { ts: "10:42:17", src: "198.51.100.42", t: "Brute-force on /admin", sev: "high" },
    { ts: "10:42:09", src: "203.0.113.7", t: "Suspicious UNION SELECT", sev: "critical" },
    { ts: "10:41:54", src: "10.0.4.18", t: "Privilege escalation: sudo→root", sev: "high" },
    { ts: "10:41:21", src: "192.0.2.99", t: "Beaconing to known C2", sev: "critical" },
    { ts: "10:40:55", src: "172.16.7.13", t: "Reflected XSS payload", sev: "medium" },
    { ts: "10:40:14", src: "198.18.5.4", t: "Anonymous TOR exit traffic", sev: "medium" },
  ];

  const sevColor: Record<string, string> = {
    medium: "text-amber-300 border-amber-300/30 bg-amber-300/5",
    high: "text-orange-300 border-orange-300/30 bg-orange-300/5",
    critical: "text-rose-300 border-rose-300/40 bg-rose-300/5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      className="relative panel holo-border p-0 overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-2 font-mono text-[11px] text-slate-400">
            sentinel · live-attack-feed
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-pulseRing" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          STREAM ACTIVE
        </div>
      </div>

      <div className="terminal relative scanline p-4 h-[420px] overflow-hidden text-[12px]">
        <pre className="text-cyber-cyan/80 mb-3">
{`> sentinel watch --tenant=acme --severity>=medium
[ok] connected to soc-edge.us-east  (rtt 14ms)
[ok] AI threat-graph engine ready  (Gemini Flash)
[stream] subscribing to live events...`}
        </pre>
        {items.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + i * 0.18, duration: 0.45 }}
            className="grid grid-cols-[80px_120px_1fr_auto] gap-3 items-center py-1.5 border-b border-white/5 last:border-0"
          >
            <span className="font-mono text-slate-500">{e.ts}</span>
            <span className="font-mono text-slate-300 truncate">{e.src}</span>
            <span className="text-slate-200 truncate">{e.t}</span>
            <span
              className={`text-[10px] uppercase font-mono tracking-wider rounded-full border px-2 py-0.5 ${sevColor[e.sev]}`}
            >
              {e.sev}
            </span>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="absolute bottom-3 left-3 right-3 rounded-xl border border-cyber-cyan/30 bg-cyber-cyan/5 p-3"
        >
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-cyber-cyan">
            <Sparkles className="w-3.5 h-3.5" />
            CyberSentinel · AI Triage
          </div>
          <p className="mt-1 text-[12px] text-slate-200 leading-snug">
            <span className="text-cyber-cyan">Conclusion:</span> 4 of the last 6
            events correlate to a single actor (203.0.113.7). Recommend
            immediate WAF block + credential rotation for{" "}
            <span className="font-mono">/admin</span>.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
