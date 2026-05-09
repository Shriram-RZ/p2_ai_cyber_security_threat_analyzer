import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  glow = false,
  padded = true,
  hover = true,
}: {
  className?: string;
  children: React.ReactNode;
  glow?: boolean;
  padded?: boolean;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "panel",
        padded && "p-5",
        hover && "panel-hover",
        glow && "shadow-glow",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon: Icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <span className="grid place-items-center w-9 h-9 rounded-lg bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/25 shrink-0">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-100 truncate">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
