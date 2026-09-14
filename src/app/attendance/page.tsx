"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, MapPin, Clock3 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SelfieCaptureModal } from "@/components/attendance/SelfieCaptureModal";

type PublicUser = {
  id: string;
  name: string;
  role: string;
  location: { name: string; radiusMeters: number } | null;
  shift: { name: string; startTime: string; endTime: string } | null;
};

type TodayStatus = "not_checked_in" | "on_site" | "checked_out";

function statusLabel(status: TodayStatus) {
  switch (status) {
    case "on_site":
      return "در محل";
    case "checked_out":
      return "خارج شده";
    default:
      return "وارد نشده";
  }
}

function statusTone(status: TodayStatus): "warning" | "success" | "neutral" {
  switch (status) {
    case "on_site":
      return "success";
    case "checked_out":
      return "neutral";
    default:
      return "warning";
  }
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("موقعیت مکانی در این دستگاه پشتیبانی نمی‌شود."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

export default function AttendancePage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [status, setStatus] = useState<TodayStatus>("not_checked_in");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [cameraOpen, setCameraOpen] = useState(false);

  const refresh = useCallback(async () => {
    const [meRes, todayRes] = await Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/attendance/today"),
    ]);
    const me = await meRes.json();
    const today = await todayRes.json();
    if (!meRes.ok) {
      router.push("/login");
      return;
    }
    setUser(me.user);
    if (today.ok) setStatus(today.status);
  }, [router]);

  useEffect(() => {
    refresh().finally(() => setBooting(false));
  }, [refresh]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  async function submitCheckIn(photoDataUrl: string) {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const pos = await getPosition();
      const res = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          photoDataUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "درخواست ناموفق بود.");
        return;
      }
      setMessage("ورود با موفقیت ثبت شد.");
      await refresh();
    } catch {
      setError("دسترسی به موقعیت مکانی لازم است.");
    } finally {
      setLoading(false);
    }
  }

  async function punchOut() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const pos = await getPosition();
      const res = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "درخواست ناموفق بود.");
        return;
      }
      setMessage("خروج با موفقیت ثبت شد.");
      await refresh();
    } catch {
      setError("دسترسی به موقعیت مکانی لازم است.");
    } finally {
      setLoading(false);
    }
  }

  if (booting) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-[var(--text-secondary)]">
        در حال بارگذاری…
      </div>
    );
  }

  const canCheckIn = status === "not_checked_in" || status === "checked_out";
  const canCheckOut = status === "on_site";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-6">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.15em] text-[var(--accent)]">صفردارو</p>
          <h1 className="mt-1 text-2xl font-semibold">{user?.name}</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} aria-label="خروج">
          <LogOut size={16} />
        </Button>
      </header>

      <GlassCard className="flex flex-1 flex-col p-6">
        <div className="space-y-3 text-sm text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[var(--accent)]" />
            <span>{user?.location?.name || "لوکیشن تعریف نشده"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 size={16} className="text-[var(--accent)]" />
            <span>
              {user?.shift
                ? `${user.shift.name} (${user.shift.startTime}–${user.shift.endTime})`
                : "شیفت تعریف نشده"}
            </span>
          </div>
        </div>

        <div className="my-10 flex flex-col items-center gap-4 transition-all duration-300">
          <div
            className={`flex h-28 w-28 items-center justify-center rounded-full border-2 ${
              status === "on_site"
                ? "border-[var(--success)]/50 bg-[var(--success)]/10"
                : "border-white/15 bg-white/5"
            }`}
          >
            <Badge tone={statusTone(status)} className="text-sm px-3 py-1.5">
              {statusLabel(status)}
            </Badge>
          </div>
          <p className="text-center text-sm text-[var(--text-muted)]">
            برای ثبت ورود، سلفی زنده + موقعیت مکانی لازم است.
          </p>
        </div>

        <div className="mt-auto space-y-3">
          {error && (
            <p className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-3 py-2.5 text-sm text-[var(--danger)]">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10 px-3 py-2.5 text-sm text-[var(--success)]">
              {message}
            </p>
          )}

          {canCheckIn && (
            <Button
              size="lg"
              className="w-full"
              loading={loading}
              onClick={() => {
                setError("");
                setMessage("");
                setCameraOpen(true);
              }}
            >
              ثبت ورود (با سلفی)
            </Button>
          )}
          {canCheckOut && (
            <Button
              size="lg"
              variant="secondary"
              className="w-full"
              loading={loading}
              onClick={punchOut}
            >
              ثبت خروج
            </Button>
          )}
        </div>
      </GlassCard>

      <SelfieCaptureModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(photo) => {
          setCameraOpen(false);
          void submitCheckIn(photo);
        }}
      />
    </div>
  );
}
