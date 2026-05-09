"use client";
import { useEffect, useState } from "react";
import { Bell, Search, LogOut, Menu, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/api";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [openProfile, setOpenProfile] = useState(false);
  const [openBell, setOpenBell] = useState(false);
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    api.notifications().then(setNotifs).catch(() => {});
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const unread = notifs.filter((n) => !n.read).length;

  async function onLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-30 panel rounded-none lg:rounded-2xl px-3 sm:px-4 h-14 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="lg:hidden p-2 rounded-lg hover:bg-white/5"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ink-900/60 border border-white/10 text-xs text-slate-400 min-w-[280px]">
          <Search className="w-3.5 h-3.5" />
          <span className="font-mono">Search threats, IPs, CVEs…</span>
          <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-ink-700/80 border border-white/10 font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-cyber-violet" />
          <span>{time.toUTCString().slice(17, 25)} UTC</span>
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setOpenBell((o) => !o);
              setOpenProfile(false);
            }}
            className="relative p-2 rounded-lg hover:bg-white/5"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid place-items-center w-4 h-4 text-[10px] rounded-full bg-rose-500 text-white">
                {unread}
              </span>
            )}
          </button>
          {openBell && (
            <div className="absolute right-0 top-12 w-[340px] panel p-0 z-50">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <div className="text-sm font-semibold">Alerts</div>
                <button
                  className="text-[11px] text-cyber-cyan hover:underline"
                  onClick={async () => {
                    await api.markAllRead();
                    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
                  }}
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {notifs.length === 0 && (
                  <div className="p-4 text-sm text-slate-400">No alerts yet.</div>
                )}
                {notifs.slice(0, 8).map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "px-4 py-3 border-b border-white/5 last:border-0 flex items-start gap-2",
                      !n.read && "bg-cyber-cyan/5",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1 w-1.5 h-1.5 rounded-full shrink-0",
                        n.severity === "critical"
                          ? "bg-rose-400"
                          : n.severity === "high"
                            ? "bg-orange-400"
                            : "bg-cyber-cyan",
                      )}
                    />
                    <div className="min-w-0">
                      <div className="text-sm text-white truncate">{n.title}</div>
                      <div className="text-xs text-slate-400 line-clamp-2">{n.body}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-white/5 text-center">
                <Link href="/dashboard/notifications" className="text-xs text-cyber-cyan hover:underline">
                  View all
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setOpenProfile((o) => !o);
              setOpenBell(false);
            }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5"
          >
            <span className="grid place-items-center w-7 h-7 rounded-lg bg-gradient-to-br from-cyber-cyan to-cyber-violet text-[11px] font-semibold text-white">
              {user?.full_name?.[0]?.toUpperCase() || "S"}
            </span>
            <div className="hidden sm:block text-left">
              <div className="text-xs text-white truncate max-w-[120px]">{user?.full_name}</div>
              <div className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
                {user?.role || "analyst"}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          {openProfile && (
            <div className="absolute right-0 top-12 w-[220px] panel p-2 z-50">
              <div className="px-3 py-2 border-b border-white/5">
                <div className="text-xs text-slate-400 truncate">{user?.email}</div>
              </div>
              <button
                onClick={onLogout}
                className="w-full mt-1 px-3 py-2 rounded-lg text-sm text-rose-300 hover:bg-rose-500/10 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
