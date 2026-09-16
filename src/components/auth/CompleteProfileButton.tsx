"use client";

import { FormEvent, useEffect, useState } from "react";
import { UserRoundPen, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { GlassCard } from "@/components/ui/GlassCard";

type ShiftOption = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
};

type ProfileUser = {
  phone?: string | null;
  shiftId?: string | null;
  passwordSet?: boolean;
};

type Props = {
  variant?: "button" | "menu";
  user?: ProfileUser | null;
  onSaved?: (user: unknown) => void;
};

export function CompleteProfileButton({
  variant = "button",
  user,
  onSaved,
}: Props) {
  const [open, setOpen] = useState(false);
  const [shifts, setShifts] = useState<ShiftOption[]>([]);
  const [phone, setPhone] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSet, setPasswordSet] = useState(!!user?.passwordSet);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingShifts, setLoadingShifts] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoadingShifts(true);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");

    async function boot() {
      try {
        const [shiftsRes, meRes] = await Promise.all([
          fetch("/api/shifts"),
          user ? Promise.resolve(null) : fetch("/api/auth/me"),
        ]);
        const shiftsData = await shiftsRes.json();
        if (!cancelled && shiftsData.ok) setShifts(shiftsData.shifts);

        if (user) {
          if (!cancelled) {
            setPhone(user.phone ?? "");
            setShiftId(user.shiftId ?? "");
            setPasswordSet(!!user.passwordSet);
          }
        } else if (meRes) {
          const me = await meRes.json();
          if (!cancelled && me.ok && me.user) {
            setPhone(me.user.phone ?? "");
            setShiftId(me.user.shiftId ?? "");
            setPasswordSet(!!me.user.passwordSet);
          }
        }
      } finally {
        if (!cancelled) setLoadingShifts(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [open, user]);

  function close() {
    setOpen(false);
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          shiftId: shiftId || null,
          ...(password ? { password, confirmPassword } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "ذخیره پروفایل ناموفق بود.");
        return;
      }
      setSuccess(data.message || "پروفایل با موفقیت ذخیره شد.");
      if (data.user?.passwordSet) setPasswordSet(true);
      onSaved?.(data.user);
      setPassword("");
      setConfirmPassword("");
      setTimeout(close, 1000);
    } catch {
      setError("خطای شبکه. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {variant === "menu" ? (
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setOpen(true)}
        >
          <UserRoundPen size={16} /> تکمیل پروفایل
        </Button>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setOpen(true)}
          aria-label="تکمیل پروفایل"
        >
          <UserRoundPen size={16} />
          <span className="hidden sm:inline">تکمیل پروفایل</span>
        </Button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="complete-profile-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <GlassCard strong className="w-full max-w-sm p-6 animate-fade-in">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="complete-profile-title"
                  className="text-lg font-semibold"
                >
                  تکمیل پروفایل
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  شیفت کاری، رمز عبور و شماره تلفن را تکمیل کنید.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-xl p-2 text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                aria-label="بستن"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-3">
              <Select
                label="شیفت کاری"
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                disabled={loadingShifts}
              >
                <option value="">انتخاب شیفت…</option>
                {shifts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.startTime}–{s.endTime})
                  </option>
                ))}
              </Select>

              <Input
                label="شماره تلفن (اختیاری)"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثلاً ۰۹۱۲…"
              />

              <Input
                label={
                  passwordSet
                    ? "رمز عبور جدید (خالی = بدون تغییر)"
                    : "رمز عبور"
                }
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!passwordSet}
                minLength={4}
              />
              <Input
                label="تکرار رمز عبور"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={!passwordSet || !!password}
                minLength={4}
              />

              {error && (
                <p className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-3 py-2 text-sm text-[var(--danger)]">
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10 px-3 py-2 text-sm text-[var(--success)]">
                  {success}
                </p>
              )}

              <Button type="submit" className="mt-1 w-full" loading={loading}>
                ذخیره پروفایل
              </Button>
            </form>
          </GlassCard>
        </div>
      )}
    </>
  );
}
