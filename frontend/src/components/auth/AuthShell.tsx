"use client";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative grid lg:grid-cols-2">
      {/* left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden">
        <div className="absolute inset-0 bg-radial" />
        <div className="absolute inset-0 grid-bg [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_85%)]" />
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-cyber-purple/30 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full bg-cyber-cyan/20 blur-[120px]" />

        <div className="relative">
          <Logo />
        </div>
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-[11px] uppercase font-mono tracking-[0.22em] text-cyber-cyan">
              SOC · v1.0 · AI Console
            </div>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-white max-w-md">
              The mission control room for{" "}
              <span className="text-gradient">AI-native security</span>.
            </h2>
            <p className="mt-4 text-slate-300 max-w-md">
              Live attack feeds, AI triage, malware behaviour, phishing detection
              and a co-pilot that actually explains its reasoning.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
              {[
                ["12.4M", "events / hr"],
                ["1.8s", "AI triage"],
                ["300+", "ATT&CK rules"],
              ].map(([v, k]) => (
                <div key={k} className="glass rounded-xl px-3 py-3">
                  <div className="text-cyber-cyan text-lg font-semibold font-mono">{v}</div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                    {k}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="relative text-xs text-slate-500 font-mono">
          © {new Date().getFullYear()} Sentinel AI · cyber-defense.systems
        </div>
      </div>

      {/* right form */}
      <div className="relative flex items-center justify-center p-6 sm:p-10">
        <div className="absolute inset-0 lg:hidden bg-radial -z-10" />
        <div className="absolute inset-0 lg:hidden grid-bg [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_85%)] -z-10" />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md panel holo-border p-8"
        >
          <div className="lg:hidden mb-6">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-sm text-slate-400">{footer}</div>}
          <div className="mt-8 text-center text-[11px] text-slate-500">
            By continuing you agree to our{" "}
            <Link href="#" className="hover:text-cyber-cyan">Terms</Link> and{" "}
            <Link href="#" className="hover:text-cyber-cyan">Privacy Policy</Link>.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
