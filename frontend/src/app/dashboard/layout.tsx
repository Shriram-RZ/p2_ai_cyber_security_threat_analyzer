"use client";
import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { CyberBackdrop } from "@/components/ui/CyberBackdrop";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [openMobile, setOpenMobile] = useState(false);
  const { user, loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-400 font-mono text-xs">
        BOOTING SOC CONSOLE…
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-ink-950">
      <CyberBackdrop variant="soft" />

      {/* desktop sidebar */}
      <div className="hidden lg:block sticky top-3 self-start h-[calc(100vh-1.5rem)] ml-3 my-3">
        <Sidebar />
      </div>

      {/* mobile drawer */}
      {openMobile && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setOpenMobile(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute left-0 top-0 bottom-0 w-[260px]" onClick={(e) => e.stopPropagation()}>
            <Sidebar onItemClick={() => setOpenMobile(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 px-3 lg:pr-3 lg:pl-3 py-3">
        <Topbar onMenu={() => setOpenMobile(true)} />
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
