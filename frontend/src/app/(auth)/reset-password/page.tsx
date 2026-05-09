"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { Lock, Key, ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [token, setToken] = useState(params.get("token") || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      toast.success("Password updated. Sign in with your new credentials.");
      router.replace("/login");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Reset failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Pick something only you and a 256-bit RNG could guess."
      footer={
        <span>
          <Link href="/login" className="text-cyber-cyan hover:underline">
            Back to sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <div className="text-[11px] uppercase tracking-[0.2em] font-mono text-slate-400 mb-1.5">
            Reset token
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Key className="w-4 h-4" />
            </span>
            <input
              required
              className="input pl-9 font-mono text-xs"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="paste your reset token"
            />
          </div>
        </label>
        <label className="block">
          <div className="text-[11px] uppercase tracking-[0.2em] font-mono text-slate-400 mb-1.5">
            New password
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type="password"
              required
              className="input pl-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
        </label>
        <Button type="submit" loading={loading} className="w-full justify-center">
          Update password <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-slate-400">Loading…</div>}>
      <ResetForm />
    </Suspense>
  );
}
