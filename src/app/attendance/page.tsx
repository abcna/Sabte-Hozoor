"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, MapPin, Clock3, CalendarDays } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { SelfieCaptureModal } from "@/components/attendance/SelfieCaptureModal";
import { LocationHelpAccordion } from "@/components/attendance/LocationHelpAccordion";
import { CompleteProfileButton } from "@/components/auth/CompleteProfileButton";
import { formatJalaliDayLabel } from "@/lib/jalali";
import { cn } from "@/lib/cn";

type PublicUser = {
  id: string;
  name: string;
  role: string;
  phone?: string;
  shiftId?: string | null;
  passwordSet?: boolean;
  location: { name: string; radiusMeters: number } | null;
  shift: { name: string; startTime: string; endTime: string } | null;
};

type TodayStatus = "not_checked_in" | "on_site" | "checked_out";

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
  const [checkInPhoto, setCheckInPhoto] = useState<string | null>(null);
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
    if (today.ok) {
      setStatus(today.status);
      setCheckInPhoto(today.checkInPhoto ?? null);
    }
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
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : "ثبت ورود ناموفق بود. لوکیشن و اینترنت را چک کنید.";
      setError(
        msg.includes("موقعیت") || msg.includes("Geolocation") || msg.includes("geolocation")
          ? "دسترسی به موقعیت مکانی لازم است. در تنظیمات Safari اجازه لوکیشن بدهید."
          : "ثبت ورود ناموفق بود. دوباره تلاش کنید.",
      );
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
          <p className="text-xs tracking-[0.15em] text-[var(--accent)]">صفا دارو</p>
          <h1 className="mt-1 text-2xl font-semibold">{user?.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <CompleteProfileButton
            user={user}
            onSaved={(updated) => setUser(updated as PublicUser)}
          />
          <Button variant="ghost" size="sm" onClick={logout} aria-label="خروج">
            <LogOut size={16} />
          </Button>
        </div>
      </header>

      <GlassCard className="flex flex-1 flex-col p-6">
        <div className="space-y-3 text-sm text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-[var(--accent)]" />
            <span>{formatJalaliDayLabel()}</span>
          </div>
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
            className={cn(
              "relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-[3px]",
              status === "on_site" &&
                "border-[var(--success)] bg-[var(--success)]/10 shadow-[0_0_28px_rgba(52,211,153,0.25)]",
              status === "not_checked_in" &&
                "border-[var(--danger)] bg-[var(--danger)]/10",
              status === "checked_out" &&
                "border-white/25 bg-white/5",
            )}
          >
            {checkInPhoto && status !== "not_checked_in" ? (
              <img
                src={checkInPhoto}
                alt="سلفی ورود"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}

            {(status === "on_site" || status === "checked_out") && checkInPhoto ? (
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 py-1.5 text-center text-sm font-bold tracking-wide text-white",
                  status === "on_site"
                    ? "bg-[var(--success)]/85"
                    : "bg-black/55",
                )}
              >
                {status === "on_site" ? "حاضر" : "خارج شده"}
              </span>
            ) : (
              <span
                className={cn(
                  "text-xl font-bold",
                  status === "not_checked_in" && "text-[var(--danger)]",
                  status === "on_site" && "text-[var(--success)]",
                  status === "checked_out" && "text-[var(--text-secondary)]",
                )}
              >
                {status === "on_site"
                  ? "حاضر"
                  : status === "checked_out"
                    ? "خارج شده"
                    : "غایب"}
              </span>
            )}
          </div>

          {status === "on_site" ? (
            <p className="max-w-[16rem] text-center text-sm leading-7 text-[var(--warning)]">
              یادت نره موقع خروج حتما باید از توی داروخانه دکمه خروج رو بزنی!
            </p>
          ) : (
            <p className="text-center text-sm text-[var(--text-muted)]">
              برای ثبت ورود، سلفی زنده + موقعیت مکانی لازم است.
            </p>
          )}
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

      <LocationHelpAccordion />

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
