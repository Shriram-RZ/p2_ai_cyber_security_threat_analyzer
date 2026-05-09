import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3 mb-5", className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/25 shadow-glow shrink-0">
            <Icon className="w-5 h-5" />
          </span>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-400 max-w-2xl">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
