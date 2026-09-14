"use client";

import { FormEvent, useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Location = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address: string | null;
};

const empty = {
  name: "",
  latitude: "",
  longitude: "",
  radiusMeters: "150",
  address: "",
};

export default function AdminLocationsPage() {
  const [items, setItems] = useState<Location[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const data = await fetch("/api/admin/locations").then((r) => r.json());
    if (data.ok) setItems(data.locations);
  }

  useEffect(() => {
    load();
  }, []);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("موقعیت مکانی در دسترس نیست.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: String(pos.coords.latitude),
          longitude: String(pos.coords.longitude),
        }));
      },
      () => setError("خواندن موقعیت فعلی ممکن نشد."),
      { enableHighAccuracy: true },
    );
  }

  function startEdit(loc: Location) {
    setEditingId(loc.id);
    setForm({
      name: loc.name,
      latitude: String(loc.latitude),
      longitude: String(loc.longitude),
      radiusMeters: String(loc.radiusMeters),
      address: loc.address || "",
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
      const payload = {
        name: form.name,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        radiusMeters: Number(form.radiusMeters),
        address: form.address || null,
      };
      const res = await fetch(
        editingId ? `/api/admin/locations/${editingId}` : "/api/admin/locations",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
    if (!confirm("این لوکیشن حذف شود؟")) return;
    await fetch(`/api/admin/locations/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">لوکیشن‌ها</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          شعب داروخانه با مرکز GPS و شعاع مجاز
        </p>
      </div>

      <GlassCard className="p-5">
        <h3 className="mb-4 font-semibold">
          {editingId ? "ویرایش لوکیشن" : "لوکیشن جدید"}
        </h3>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="نام"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <Input
            label="عرض جغرافیایی (Latitude)"
            value={form.latitude}
            onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            required
          />
          <Input
            label="طول جغرافیایی (Longitude)"
            value={form.longitude}
            onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            required
          />
          <Input
            label="شعاع مجاز (متر)"
            value={form.radiusMeters}
            onChange={(e) => setForm({ ...form, radiusMeters: e.target.value })}
            required
          />
          <Input
            label="آدرس (اختیاری)"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          {error && (
            <p className="sm:col-span-2 text-sm text-[var(--danger)]">{error}</p>
          )}
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <Button type="submit" loading={loading}>
              {editingId ? "بروزرسانی" : "ایجاد"}
            </Button>
            <Button type="button" variant="secondary" onClick={useMyLocation}>
              استفاده از موقعیت فعلی من
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={reset}>
                انصراف
              </Button>
            )}
          </div>
        </form>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-right text-sm">
            <thead className="border-b border-[var(--glass-border)] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">نام</th>
                <th className="px-4 py-3 font-medium">مختصات</th>
                <th className="px-4 py-3 font-medium">شعاع</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {items.map((loc, i) => (
                <tr key={loc.id} className={i % 2 ? "bg-white/[0.02]" : undefined}>
                  <td className="px-4 py-3 font-medium">{loc.name}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]" dir="ltr">
                    {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                  </td>
                  <td className="px-4 py-3">{loc.radiusMeters} متر</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-start gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(loc)}>
                        ویرایش
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => remove(loc.id)}>
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
