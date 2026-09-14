"use client";

import { FormEvent, useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Shift = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
};

const empty = { name: "", startTime: "08:00", endTime: "16:00" };

export default function AdminShiftsPage() {
  const [items, setItems] = useState<Shift[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const data = await fetch("/api/admin/shifts").then((r) => r.json());
    if (data.ok) setItems(data.shifts);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(shift: Shift) {
    setEditingId(shift.id);
    setForm({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
    });
  }

  function reset() {
    setEditingId(null);
    setForm(empty);
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        editingId ? `/api/admin/shifts/${editingId}` : "/api/admin/shifts",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "ذخیره ناموفق بود.");
        return;
      }
      reset();
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("این شیفت حذف شود؟")) return;
    await fetch(`/api/admin/shifts/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">شیفت‌ها</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          بازه‌های کاری قابل اختصاص به پرسنل
        </p>
      </div>

      <GlassCard className="p-5">
        <h3 className="mb-4 font-semibold">
          {editingId ? "ویرایش شیفت" : "شیفت جدید"}
        </h3>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-3">
          <Input
            label="نام"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="شروع (HH:mm)"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            placeholder="08:00"
            required
            dir="ltr"
          />
          <Input
            label="پایان (HH:mm)"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            placeholder="16:00"
            required
            dir="ltr"
          />
          {error && (
            <p className="sm:col-span-3 text-sm text-[var(--danger)]">{error}</p>
          )}
          <div className="sm:col-span-3 flex gap-2">
            <Button type="submit" loading={loading}>
              {editingId ? "بروزرسانی" : "ایجاد"}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={reset}>
                انصراف
              </Button>
            )}
          </div>
        </form>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead className="border-b border-[var(--glass-border)] text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-3 font-medium">نام</th>
              <th className="px-4 py-3 font-medium">بازه</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {items.map((s, i) => (
              <tr key={s.id} className={i % 2 ? "bg-white/[0.02]" : undefined}>
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)]" dir="ltr">
                  {s.startTime} – {s.endTime}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-start gap-2">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(s)}>
                      ویرایش
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => remove(s.id)}>
                      حذف
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
