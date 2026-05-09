import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-ink-700/40 via-ink-600/40 to-ink-700/40",
        className,
      )}
    />
  );
}
