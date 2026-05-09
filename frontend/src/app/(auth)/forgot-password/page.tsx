"use client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      toast.success(res.message);
      if (res.reset_token) setToken(res.reset_token);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Recover access"
      subtitle="We'll generate a secure reset link tied to your account."
      footer={
        <span>
          Remembered it?{" "}
          <Link href="/login" className="text-cyber-cyan hover:underline">
            Back to sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <div className="text-[11px] uppercase tracking-[0.2em] font-mono text-slate-400 mb-1.5">
            Email
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              className="input pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ada@yourorg.com"
            />
          </div>
        </label>
        <Button type="submit" loading={loading} className="w-full justify-center">
          Generate reset link <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
      {token && (
        <div className="mt-5 panel p-4 text-xs">
          <div className="font-mono text-cyber-cyan mb-2">Dev mode reset token</div>
          <code className="block break-all bg-ink-950/80 p-2 rounded border border-ink-700 text-emerald-200 font-mono">
            {token}
          </code>
          <Link
            href={`/reset-password?token=${encodeURIComponent(token)}`}
            className="mt-3 inline-block text-cyber-cyan hover:underline"
          >
            → Open reset page with token
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
