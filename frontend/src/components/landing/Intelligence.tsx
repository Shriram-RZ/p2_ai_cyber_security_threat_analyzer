"use client";
import { motion } from "framer-motion";
import { Globe, Radar, AlertTriangle } from "lucide-react";

export function Intelligence() {
  const dots = Array.from({ length: 32 }, (_, i) => ({
    id: i,
    left: 5 + Math.random() * 90,
    top: 5 + Math.random() * 90,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 3,
  }));

  return (
    <section id="intelligence" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <div className="text-[11px] uppercase tracking-[0.22em] text-cyber-violet font-mono">
            03 — Intelligence Mesh
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            A worldview your SOC can trust.
          </h2>
          <p className="mt-4 text-slate-300 leading-relaxed">
            Sentinel fuses your tenant telemetry with curated global feeds —
            CISA KEV, MITRE ATT&CK, NVD CVE — and gives you the same operational
            picture a Tier-1 SOC has, in your browser.
          </p>

          <ul className="mt-7 space-y-3">
            {[
              { Icon: Radar, t: "Real-time correlation across logs, IPs, malware and phishing." },
              { Icon: AlertTriangle, t: "Severity-aware notifications + AI mitigation playbooks." },
              { Icon: Globe, t: "Suspicious IP graph with 1-click block / unblock." },
            ].map(({ Icon, t }, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className="flex items-start gap-3 text-sm text-slate-200"
              >
                <span className="grid place-items-center w-8 h-8 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/25 text-cyber-cyan">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="pt-1">{t}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-7"
        >
          <div className="relative panel holo-border p-0 overflow-hidden h-[440px]">
            {/* world overlay (abstract grid + dots = "global threat radar") */}
            <div className="absolute inset-0 grid-bg opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(124,58,237,0.18),transparent_60%),radial-gradient(circle_at_75%_60%,rgba(34,211,238,0.18),transparent_55%)]" />
            {/* concentric radar */}
            <div className="absolute inset-0 grid place-items-center">
              {[160, 250, 340, 440].map((s, i) => (
                <motion.div
                  key={s}
                  className="absolute rounded-full border border-cyber-cyan/15"
                  style={{ width: s, height: s }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, ease: "linear", duration: 30 + i * 6 }}
                />
              ))}
              <div className="absolute w-2 h-2 rounded-full bg-cyber-cyan shadow-[0_0_18px_rgba(34,211,238,0.9)]" />
              {dots.map((d) => (
                <motion.div
                  key={d.id}
                  className="absolute rounded-full bg-cyber-violet/80 shadow-[0_0_8px_rgba(167,139,250,0.7)]"
                  style={{
                    width: d.size,
                    height: d.size,
                    left: `${d.left}%`,
                    top: `${d.top}%`,
                  }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    delay: d.delay,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
            {/* HUD overlays */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>SENTINEL · GLOBAL THREAT RADAR</span>
              <span className="text-emerald-300">SYNC OK · 94 nodes</span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-3 text-[11px]">
              {[
                { k: "Active alerts", v: "12,481", c: "text-cyber-cyan" },
                { k: "Blocked IPs / 24h", v: "3,402", c: "text-cyber-violet" },
                { k: "Avg AI triage", v: "1.8s", c: "text-emerald-300" },
              ].map((m) => (
                <div key={m.k} className="glass rounded-lg px-3 py-2">
                  <div className="text-slate-400 uppercase tracking-wider text-[9px] font-mono">
                    {m.k}
                  </div>
                  <div className={`mt-1 font-mono font-semibold ${m.c}`}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
