import { cn } from "@/lib/utils";
import Link from "next/link";

type Variant = "primary" | "ghost" | "danger";

interface BaseProps {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  loading?: boolean;
}

function classes(variant: Variant = "primary", className?: string) {
  const base =
    variant === "primary"
      ? "btn-primary"
      : variant === "danger"
        ? "btn-ghost border-rose-400/40 hover:border-rose-400 text-rose-200 hover:text-white"
        : "btn-ghost";
  return cn(base, className);
}

export function Button({
  variant = "primary",
  className,
  children,
  icon,
  loading,
  disabled,
  type = "button",
  ...rest
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(classes(variant, className), (disabled || loading) && "opacity-60 pointer-events-none")}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      <span>{children}</span>
    </button>
  );
}

export function LinkButton({
  variant = "primary",
  className,
  children,
  icon,
  href,
}: BaseProps & { href: string }) {
  return (
    <Link href={href} className={classes(variant, className)}>
      {icon}
      <span>{children}</span>
    </Link>
  );
}

function Spinner() {
  return (
    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
  );
}
