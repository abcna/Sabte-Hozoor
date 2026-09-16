"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatJalaliDateTime } from "@/lib/jalali";

type UserOption = { id: string; name: string };
type RecordRow = {
  id: string;
  type: "check_in" | "check_out";
  recordedAt: string;
  distanceMeters: number;
  hasPhoto: boolean;
  user: { id: string; name: string; username: string };
  location: { id: string; name: string };
};

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function load() {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId);
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(to).toISOString());

    const [att, u] = await Promise.all([
      fetch(`/api/admin/attendance?${params}`).then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
    ]);
    if (att.ok) setRecords(att.records);
    if (u.ok)
      setUsers(
        u.users.map((x: { id: string; name: string }) => ({
          id: x.id,
          name: x.name,
        })),
      );
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">حضور و غیاب</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          آخرین ثبت‌های ورود و خروج — عکس سلفی برای ورودها
        </p>
      </div>

      <GlassCard className="p-5">
        <div className="grid gap-3 sm:grid-cols-4">
          <Select
            label="کاربر"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            <option value="">همه کاربران</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
          <Input
            label="از تاریخ"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            dir="ltr"
          />
          <Input
            label="تا تاریخ"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            dir="ltr"
          />
          <div className="flex items-end">
            <Button className="w-full" onClick={load}>
              اعمال فیلتر
            </Button>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-right text-sm">
            <thead className="border-b border-[var(--glass-border)] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">زمان</th>
                <th className="px-4 py-3 font-medium">کاربر</th>
                <th className="px-4 py-3 font-medium">نوع</th>
                <th className="px-4 py-3 font-medium">لوکیشن</th>
                <th className="px-4 py-3 font-medium">فاصله</th>
                <th className="px-4 py-3 font-medium">عکس</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-[var(--text-muted)]"
                  >
                    هنوز رکوردی ثبت نشده
                  </td>
                </tr>
              )}
              {records.map((r, i) => (
                <tr key={r.id} className={i % 2 ? "bg-white/[0.02]" : undefined}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatJalaliDateTime(r.recordedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.user.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {r.user.username}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={r.type === "check_in" ? "success" : "neutral"}>
                      {r.type === "check_in" ? "ورود" : "خروج"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{r.location.name}</td>
                  <td className="px-4 py-3">{Math.round(r.distanceMeters)} متر</td>
                  <td className="px-4 py-3">
                    {r.hasPhoto ? (
                      <button
                        type="button"
                        className="text-[var(--accent)] hover:underline"
                        onClick={() =>
                          setPreviewUrl(`/api/admin/attendance/${r.id}/photo`)
                        }
                      >
                        مشاهده
                      </button>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <GlassCard
            strong
            className="max-h-[90vh] max-w-lg overflow-hidden p-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="سلفی ثبت ورود"
              className="max-h-[80vh] w-full rounded-xl object-contain"
            />
            <div className="mt-3 flex justify-end">
              <Button variant="secondary" onClick={() => setPreviewUrl(null)}>
                بستن
              </Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
