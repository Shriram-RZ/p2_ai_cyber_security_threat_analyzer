"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

const TIERS = [
  {
    name: "Hunter",
    price: "$0",
    suffix: "/mo",
    summary: "For analysts and home labs.",
    cta: { label: "Start free", href: "/signup" },
    features: [
      "AI log analysis (50 / day)",
      "Phishing & malware scans",
      "AI SOC chat assistant",
      "PDF threat reports",
    ],
  },
  {
    name: "Operator",
    price: "$49",
    suffix: "/mo",
    summary: "For SMB and growing security teams.",
    highlighted: true,
    cta: { label: "Start 14-day trial", href: "/signup" },
    features: [
      "Unlimited AI analyses",
      "Live monitoring stream",
      "Suspicious IP graph + auto-block",
      "Incident response workflow",
      "CVE search + intel feed",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    suffix: "",
    summary: "For SOCs, MSSPs and regulated environments.",
    cta: { label: "Talk to sales", href: "/signup" },
    features: [
      "SSO / SAML, RBAC, audit logs",
      "VPC / on-prem deployment",
      "Custom detections & playbooks",
      "Dedicated AI residency",
      "SLA + 24/7 SOC concierge",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-[11px] uppercase tracking-[0.22em] text-cyber-cyan font-mono">
            04 — Pricing
          </div>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            One platform. Three tiers. Zero noise.
          </h2>
          <p className="mt-4 text-slate-300">
            Start in seconds. Scale to enterprise without re-platforming.
          </p>
        </div>

        <div className="mt-12 grid lg:grid-cols-3 gap-5">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className={`relative panel p-6 ${
                tier.highlighted
                  ? "holo-border shadow-glowPurple ring-1 ring-cyber-violet/40"
                  : ""
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-6 text-[10px] font-mono uppercase tracking-[0.2em] rounded-full px-2 py-0.5 bg-cyber-violet/30 border border-cyber-violet/50 text-cyber-violet">
                  Most popular
                </div>
              )}
              <div className="text-sm text-slate-400">{tier.summary}</div>
              <div className="mt-2 text-2xl font-semibold text-white">{tier.name}</div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-gradient">{tier.price}</span>
                <span className="text-sm text-slate-400">{tier.suffix}</span>
              </div>
              <ul className="mt-6 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-200">
                    <Check className="w-4 h-4 mt-0.5 text-cyber-cyan shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <LinkButton
                  href={tier.cta.href}
                  variant={tier.highlighted ? "primary" : "ghost"}
                  className="w-full justify-center"
                >
                  {tier.cta.label}
                </LinkButton>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
