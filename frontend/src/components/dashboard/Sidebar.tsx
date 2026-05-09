"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  Bug,
  FileSearch,
  Bot,
  Globe2,
  Activity,
  AlertTriangle,
  Network,
  Bell,
  ScrollText,
  BookOpen,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const NAV: { group: string; items: { href: string; label: string; icon: any }[] }[] = [
  {
    group: "Operations",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/live", label: "Live Monitor", icon: Activity },
      { href: "/dashboard/incidents", label: "Incidents", icon: ScrollText },
      { href: "/dashboard/timeline", label: "Attack Timeline", icon: Network },
    ],
  },
  {
    group: "AI Analysis",
    items: [
      { href: "/dashboard/threats", label: "Threat Analyzer", icon: ShieldCheck },
      { href: "/dashboard/malware", label: "Malware Engine", icon: Bug },
      { href: "/dashboard/phishing", label: "Phishing Detector", icon: FileSearch },
      { href: "/dashboard/chat", label: "AI SOC Co-pilot", icon: Bot },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { href: "/dashboard/intel", label: "Threat Intel Feed", icon: Globe2 },
      { href: "/dashboard/ips", label: "Suspicious IPs", icon: AlertTriangle },
      { href: "/dashboard/cve", label: "CVE Search", icon: BookOpen },
      { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
    ],
  },
];

export function Sidebar({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="h-full w-[260px] shrink-0 panel rounded-none lg:rounded-2xl flex flex-col">
      <div className="px-4 py-5 border-b border-white/5">
        <Logo />
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
        {NAV.map((group) => (
          <div key={group.group}>
            <div className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.22em] font-mono text-slate-500">
              {group.group}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      onClick={onItemClick}
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition",
                        active
                          ? "bg-cyber-cyan/10 text-white"
                          : "text-slate-300 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-gradient-to-b from-cyber-cyan via-cyber-violet to-cyber-rose" />
                      )}
                      <item.icon
                        className={cn(
                          "w-4 h-4",
                          active ? "text-cyber-cyan" : "text-slate-400 group-hover:text-cyber-cyan",
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-white/5">
        <div className="glass rounded-xl p-3">
          <div className="text-[10px] uppercase font-mono tracking-[0.2em] text-emerald-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems nominal
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            edge:us-east · ai:gemini-flash
          </div>
        </div>
      </div>
    </aside>
  );
}
