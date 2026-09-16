"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          ...(needsPassword || password ? { password } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.requiresPassword) {
          setNeedsPassword(true);
        }
        setError(data.message || "ورود ناموفق بود.");
        return;
      }
      router.push(data.user.role === "admin" ? "/admin" : "/attendance");
      router.refresh();
    } catch {
      setError("خطای شبکه. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <GlassCard className="w-full max-w-md p-8 animate-fade-in">
        <div className="mb-8 text-center">
          <p className="text-xs tracking-[0.15em] text-[var(--accent)]">
            SAFA DAROO
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">ورود</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            سامانه حضور و غیاب داروخانه
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            label="نام کاربری"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (needsPassword) {
                setNeedsPassword(false);
                setPassword("");
              }
            }}
            required
            autoFocus
          />

          {needsPassword && (
            <Input
              label="رمز عبور"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          )}

          {error && (
            <p className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" className="mt-2 w-full" loading={loading}>
            ورود
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
