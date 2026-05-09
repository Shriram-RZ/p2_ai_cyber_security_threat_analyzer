"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back, Operator.");
      router.replace("/dashboard");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Login failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Sign in to Sentinel"
      subtitle="Re-enter the SOC. Your console is waiting."
      footer={
        <div className="flex items-center justify-between">
          <Link href="/forgot-password" className="hover:text-cyber-cyan">
            Forgot password?
          </Link>
          <span>
            New here?{" "}
            <Link href="/signup" className="text-cyber-cyan hover:underline">
              Create account
            </Link>
          </span>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          icon={<Mail className="w-4 h-4" />}
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="analyst@yourorg.com"
        />
        <Field
          icon={<Lock className="w-4 h-4" />}
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <Button type="submit" loading={loading} className="w-full justify-center mt-2">
          Enter Console <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </AuthShell>
  );
}

function Field({
  icon,
  label,
  ...rest
}: { icon?: React.ReactNode; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-[0.2em] font-mono text-slate-400 mb-1.5">
        {label}
      </div>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</span>
        )}
        <input className={`input ${icon ? "pl-9" : ""}`} {...rest} />
      </div>
    </label>
  );
}
