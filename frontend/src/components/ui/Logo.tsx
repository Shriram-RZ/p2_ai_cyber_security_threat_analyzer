import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 group", className)}>
      <span className="relative grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyber-cyan/20 via-cyber-purple/20 to-cyber-rose/20 border border-cyber-cyan/30 shadow-glow">
        <svg viewBox="0 0 32 32" className="w-5 h-5">
          <defs>
            <linearGradient id="lg" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="60%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>
          <path
            d="M16 3 L27 7 V16 C27 23 22 28 16 30 C10 28 5 23 5 16 V7 Z"
            fill="none"
            stroke="url(#lg)"
            strokeWidth="2"
          />
          <path
            d="M11 16 L15 20 L21 12"
            fill="none"
            stroke="url(#lg)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 group-hover:ring-cyber-cyan/40 transition" />
      </span>
      <div className="leading-tight">
        <div className="text-[15px] font-semibold tracking-tight text-white">
          Sentinel<span className="text-gradient">AI</span>
        </div>
        <div className="text-[10px] uppercase font-mono text-slate-500 tracking-[0.18em]">
          Cyber Intelligence
        </div>
      </div>
    </Link>
  );
}
