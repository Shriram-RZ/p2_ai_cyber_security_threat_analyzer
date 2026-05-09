"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    setLoading(true);
    try {
      await signup(email, password, full_name);
      toast.success("Welcome aboard. Booting your SOC console…");
      router.replace("/dashboard");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Signup failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Provision your SOC"
      subtitle="60 seconds to your first AI-powered threat report."
      footer={
        <div className="flex items-center justify-between">
          <span>
            Already have access?{" "}
            <Link href="/login" className="text-cyber-cyan hover:underline">
              Sign in
            </Link>
          </span>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          icon={<UserIcon className="w-4 h-4" />}
          label="Full name"
          required
          value={full_name}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ada Lovelace"
        />
        <Field
          icon={<Mail className="w-4 h-4" />}
          label="Work email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ada@yourorg.com"
        />
        <Field
          icon={<Lock className="w-4 h-4" />}
          label="Password"
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
        <Button type="submit" loading={loading} className="w-full justify-center mt-2">
          Create account <ArrowRight className="w-4 h-4" />
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
