import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const dd = Math.floor(h / 24);
  return `${dd}d ago`;
}

export function severityColor(sev?: string) {
  switch ((sev || "").toLowerCase()) {
    case "low":
      return "text-emerald-300";
    case "medium":
      return "text-amber-300";
    case "high":
      return "text-orange-300";
    case "critical":
      return "text-rose-300";
    default:
      return "text-slate-300";
  }
}

export function severityPill(sev?: string) {
  const s = (sev || "low").toLowerCase();
  return `severity-pill severity-pill-${s}`;
}

export function shortId(prefix = "s") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
