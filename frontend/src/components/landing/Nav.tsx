"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { LinkButton } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";

const links = [
  { href: "#features", label: "Features" },
  { href: "#workflow", label: "Workflow" },
  { href: "#intelligence", label: "Intelligence" },
  { href: "#pricing", label: "Pricing" },
];

export function LandingNav() {
  const { user } = useAuth();
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-40 w-full"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent" />
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mt-3 flex items-center justify-between rounded-2xl glass px-3 py-2.5 shadow-glass">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <LinkButton href="/dashboard" variant="primary" className="!px-3.5 !py-2 text-xs">
                Open Console
              </LinkButton>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
                >
                  Sign in
                </Link>
                <LinkButton href="/signup" variant="primary" className="!px-3.5 !py-2 text-xs">
                  Get Started
                </LinkButton>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
