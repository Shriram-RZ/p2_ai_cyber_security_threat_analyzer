"use client";
import { motion } from "framer-motion";
import { Upload, Brain, Activity, ShieldCheck } from "lucide-react";

const STEPS = [
  {
    Icon: Upload,
    title: "Ingest",
    desc: "Logs, payloads, URLs, samples or live event streams.",
  },
  {
    Icon: Brain,
    title: "Reason",
    desc: "AI maps signals to ATT&CK tactics, attack chains, and IOCs.",
  },
  {
    Icon: Activity,
    title: "Score",
    desc: "Each event gets a 0–100 risk score with full rationale.",
  },
  {
    Icon: ShieldCheck,
    title: "Respond",
    desc: "Block IPs, generate reports, and trigger automated playbooks.",
  },
];

export function Workflow() {
  return (
    <section id="workflow" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <div className="text-[11px] uppercase tracking-[0.22em] text-cyber-violet font-mono">
            02 — Operating Loop
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            From raw signal to confident action.
          </h2>
          <p className="mt-4 text-slate-300">
            Sentinel runs a tight detect-reason-score-respond loop, augmented by an LLM that
            actually explains itself.
          </p>
        </motion.div>

        <div className="mt-12 grid lg:grid-cols-4 gap-5 relative">
          <div className="hidden lg:block absolute left-0 right-0 top-12 h-px bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent" />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="panel panel-hover relative pt-8"
            >
              <div className="absolute -top-5 left-5">
                <div className="grid place-items-center w-10 h-10 rounded-xl bg-ink-900 border border-cyber-cyan/30 shadow-glow">
                  <s.Icon className="w-5 h-5 text-cyber-cyan" />
                </div>
              </div>
              <div className="text-[10px] uppercase font-mono tracking-[0.2em] text-slate-500">
                Step {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-1 text-base font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
