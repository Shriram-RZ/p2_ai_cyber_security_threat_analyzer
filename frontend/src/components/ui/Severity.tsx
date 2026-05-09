import { cn, severityPill } from "@/lib/utils";
import { ShieldAlert, ShieldCheck, ShieldX, AlertTriangle } from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  low: ShieldCheck,
  medium: AlertTriangle,
  high: ShieldAlert,
  critical: ShieldX,
};

export function SeverityBadge({
  severity,
  className,
  showIcon = true,
}: {
  severity: string;
  className?: string;
  showIcon?: boolean;
}) {
  const sev = (severity || "low").toLowerCase();
  const Icon = ICONS[sev] ?? ShieldCheck;
  return (
    <span className={cn(severityPill(sev), className)}>
      {showIcon && <Icon className="w-3 h-3" strokeWidth={2.5} />}
      {sev}
    </span>
  );
}
