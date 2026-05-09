"use client";
import { motion } from "framer-motion";
import { LinkButton } from "@/components/ui/Button";

export function CTA() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden panel holo-border p-10 sm:p-14"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.18),transparent_50%),radial-gradient(circle_at_80%_100%,rgba(124,58,237,0.22),transparent_50%)]" />
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                Stand up an AI-native SOC <span className="text-gradient">in minutes</span>.
              </h2>
              <p className="mt-4 text-slate-300 max-w-xl">
                Free to start. Paste a log, scan a URL, ask the assistant — and
                see exactly how your defenses hold up.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <LinkButton href="/signup">Create free account</LinkButton>
              <LinkButton href="/login" variant="ghost">
                Sign in
              </LinkButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
