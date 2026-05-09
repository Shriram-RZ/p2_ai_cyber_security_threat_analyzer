"use client";
import { motion } from "framer-motion";
import {
  Bot,
  ScanLine,
  FileSearch,
  Bug,
  Globe2,
  ShieldAlert,
  Sparkles,
  GitGraph,
  Lock,
  Activity,
  Workflow,
  Wand2,
} from "lucide-react";

const FEATURES = [
  {
    Icon: ScanLine,
    title: "AI Log Analysis",
    desc: "Drop in raw syslog, web access logs, or auth logs. Sentinel correlates events, maps to MITRE ATT&CK and surfaces the attack chain.",
    accent: "from-cyber-cyan/30 to-transparent",
  },
  {
    Icon: Bug,
    title: "Malware Behavior Engine",
    desc: "Static + behavioral inference. Detects ransomware, persistence, C2, anti-analysis and exfiltration patterns with IOC extraction.",
    accent: "from-rose-500/30 to-transparent",
  },
  {
    Icon: FileSearch,
    title: "Phishing Detection",
    desc: "URL, email and message triage. Spots brand impersonation, lookalikes, urgency tactics and suspicious TLDs in milliseconds.",
    accent: "from-cyber-violet/30 to-transparent",
  },
  {
    Icon: Bot,
    title: "AI SOC Co-pilot",
    desc: "Chat with CyberSentinel. Ask about threats, CVEs, attacker TTPs, or paste a payload — get a SOC-grade explanation back.",
    accent: "from-emerald-500/30 to-transparent",
  },
  {
    Icon: Globe2,
    title: "Threat Intelligence Feed",
    desc: "Curated global alerts plus your tenant-level activity. CVE search via NVD with CVSS context.",
    accent: "from-amber-400/30 to-transparent",
  },
  {
    Icon: ShieldAlert,
    title: "Risk Scoring & Reports",
    desc: "Every detection produces a 0–100 risk score, severity, and a downloadable PDF report ready to hand to leadership.",
    accent: "from-pink-500/30 to-transparent",
  },
];

const PILLARS = [
  { Icon: Sparkles, title: "AI-first" },
  { Icon: Lock, title: "Zero-trust" },
  { Icon: Activity, title: "Real-time" },
  { Icon: Workflow, title: "Automatable" },
  { Icon: Wand2, title: "Explainable" },
  { Icon: GitGraph, title: "Graph-aware" },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <div className="text-[11px] uppercase tracking-[0.22em] text-cyber-cyan font-mono">
            01 — Capabilities
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Every signal, instantly understood.
          </h2>
          <p className="mt-4 text-slate-300 text-base leading-relaxed">
            One platform that ingests, reasons, explains and recommends. Replace
            a stack of tools with a single AI-native cyber brain.
          </p>
        </motion.div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative panel panel-hover overflow-hidden"
            >
              <div
                className={`pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r ${f.accent}`}
              />
              <div className="flex items-start gap-3">
                <div className="grid place-items-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 group-hover:border-cyber-cyan/40 transition">
                  <f.Icon className="w-5 h-5 text-cyber-cyan" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-3 sm:grid-cols-6 gap-3">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.04 * i }}
              className="glass rounded-xl px-3 py-3 flex items-center gap-2 text-xs text-slate-300"
            >
              <p.Icon className="w-4 h-4 text-cyber-violet" />
              {p.title}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
