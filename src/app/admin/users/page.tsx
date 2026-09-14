"use client";

import { FormEvent, useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Location = { id: string; name: string };
type Shift = { id: string; name: string };
type UserRow = {
  id: string;
  name: string;
  username: string;
  phone: string;
  role: "admin" | "employee";
  isActive: boolean;
  locationId: string | null;
  shiftId: string | null;
  location: Location | null;
  shift: Shift | null;
};

const emptyForm = {
  name: "",
  username: "",
  password: "",
  phone: "",
  role: "employee" as "admin" | "employee",
  locationId: "",
  shiftId: "",
  isActive: true,
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const [u, l, s] = await Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/locations").then((r) => r.json()),
      fetch("/api/admin/shifts").then((r) => r.json()),
    ]);
    if (u.ok) setUsers(u.users);
    if (l.ok) setLocations(l.locations);
    if (s.ok) setShifts(s.shifts);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(user: UserRow) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      username: user.username,
      password: "",
      phone: user.phone,
      role: user.role,
      locationId: user.locationId || "",
      shiftId: user.shiftId || "",
      isActive: user.isActive,
    });
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        locationId: form.locationId || null,
        shiftId: form.shiftId || null,
      };

      const res = await fetch(
        editingId ? `/api/admin/users/${editingId}` : "/api/admin/users",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            editingId
              ? {
                  name: form.name,
                  username: form.username,
                  phone: form.phone,
                  role: form.role,
                  locationId: form.locationId || null,
                  shiftId: form.shiftId || null,
                  isActive: form.isActive,
                  ...(form.password ? { password: form.password } : {}),
                }
              : payload,
          ),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "ذخیره ناموفق بود.");
        return;
      }
      resetForm();
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("این کاربر حذف شود؟")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "حذف ناموفق بود.");
      return;
    }
    await load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">کاربران</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          ساخت حساب و اختصاص لوکیشن و شیفت
        </p>
      </div>

      <GlassCard className="p-5">
        <h3 className="mb-4 font-semibold">
          {editingId ? "ویرایش کاربر" : "کاربر جدید"}
        </h3>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <Input
            label="نام"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="نام کاربری"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
          <Input
            label={editingId ? "رمز عبور (خالی = بدون تغییر)" : "رمز عبور"}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editingId}
          />
          <Input
            label="شماره تلفن"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <Select
            label="نقش"
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value as "admin" | "employee" })
            }
          >
            <option value="employee">کارمند</option>
            <option value="admin">ادمین</option>
          </Select>
          <Select
            label="لوکیشن"
            value={form.locationId}
            onChange={(e) => setForm({ ...form, locationId: e.target.value })}
          >
            <option value="">— بدون لوکیشن —</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
          <Select
            label="شیفت"
            value={form.shiftId}
            onChange={(e) => setForm({ ...form, shiftId: e.target.value })}
          >
            <option value="">— بدون شیفت —</option>
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Select
            label="وضعیت"
            value={form.isActive ? "1" : "0"}
            onChange={(e) => setForm({ ...form, isActive: e.target.value === "1" })}
          >
            <option value="1">فعال</option>
            <option value="0">غیرفعال</option>
          </Select>

          {error && (
            <p className="sm:col-span-2 text-sm text-[var(--danger)]">{error}</p>
          )}

          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" loading={loading}>
              {editingId ? "بروزرسانی" : "ایجاد"}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                انصراف
              </Button>
            )}
          </div>
        </form>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-right text-sm">
            <thead className="border-b border-[var(--glass-border)] text-[var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">نام</th>
                <th className="px-4 py-3 font-medium">نام کاربری</th>
                <th className="px-4 py-3 font-medium">لوکیشن</th>
                <th className="px-4 py-3 font-medium">شیفت</th>
                <th className="px-4 py-3 font-medium">وضعیت</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  className={i % 2 ? "bg-white/[0.02]" : undefined}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{u.phone}</div>
                  </td>
                  <td className="px-4 py-3">{u.username}</td>
                  <td className="px-4 py-3">{u.location?.name || "—"}</td>
                  <td className="px-4 py-3">{u.shift?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={u.isActive ? "success" : "danger"}>
                      {u.isActive ? "فعال" : "غیرفعال"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-start gap-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(u)}>
                        ویرایش
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => remove(u.id)}>
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
