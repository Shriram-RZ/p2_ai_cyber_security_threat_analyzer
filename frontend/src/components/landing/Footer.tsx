import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const cols = [
    {
      title: "Platform",
      items: ["Threat Analyzer", "Phishing", "Malware", "AI Co-pilot", "Live Monitor"],
    },
    {
      title: "Intelligence",
      items: ["MITRE ATT&CK", "CVE Search", "CISA KEV", "IOC Hunting"],
    },
    {
      title: "Company",
      items: ["About", "Security", "Careers", "Press"],
    },
    {
      title: "Resources",
      items: ["Docs", "Status", "Changelog", "Trust Center"],
    },
  ];
  return (
    <footer className="relative border-t border-white/5 mt-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-6 gap-10">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-slate-400 max-w-sm">
              Sentinel AI — the AI co-pilot for modern cyber operations.
              Built for analysts, loved by CISOs.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-mono text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All systems operational
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-[11px] uppercase tracking-[0.18em] font-mono text-slate-400">
                {c.title}
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {c.items.map((i) => (
                  <li key={i} className="hover:text-cyber-cyan transition cursor-pointer">
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-slate-500">
          <div>© {new Date().getFullYear()} Sentinel AI · Built with cyber love.</div>
          <div className="font-mono">v1.0.0 · build:{Math.random().toString(36).slice(2, 8)}</div>
        </div>
      </div>
    </footer>
  );
}
