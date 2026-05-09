"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { SeverityBadge } from "@/components/ui/Severity";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import type { Notification } from "@/types/api";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .notifications()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  async function readAll() {
    try {
      await api.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All alerts marked read.");
    } catch {
      toast.error("Failed.");
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Bell}
        title="Notifications"
        subtitle="Severity-aware alerts from across your AI threat pipeline."
        action={
          <Button variant="ghost" onClick={readAll} icon={<CheckCheck className="w-4 h-4" />}>
            Mark all read
          </Button>
        }
      />
      <Card>
        {loading ? (
          <Skeleton className="h-[300px]" />
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No notifications yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {items.map((n, i) => (
              <motion.li
                key={n.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={cn(
                  "py-4 flex items-start gap-3",
                  !n.read && "relative pl-3 -ml-3 bg-cyber-cyan/5 rounded-lg",
                )}
              >
                {!n.read && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-cyber-cyan" />
                )}
                <SeverityBadge severity={n.severity} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{n.title}</div>
                  <div className="text-sm text-slate-300 mt-0.5">{n.body}</div>
                  <div className="text-[11px] font-mono text-slate-500 mt-1">
                    {timeAgo(n.created_at)}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
