"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Clock3,
  ClipboardList,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { CompleteProfileButton } from "@/components/auth/CompleteProfileButton";

const links = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard },
  { href: "/admin/users", label: "کاربران", icon: Users },
  { href: "/admin/locations", label: "لوکیشن‌ها", icon: MapPin },
  { href: "/admin/shifts", label: "شیفت‌ها", icon: Clock3 },
  { href: "/admin/attendance", label: "حضور و غیاب", icon: ClipboardList },
];

export function AdminShell({
  children,
  adminName,
}: {
  children: React.ReactNode;
  adminName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {links.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]",
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-7xl gap-0 md:gap-6 md:p-6">
      <aside className="glass hidden w-64 shrink-0 flex-col rounded-2xl md:flex">
        <div className="border-b border-[var(--glass-border)] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
            صفادارو
          </p>
          <h1 className="mt-1 text-lg font-semibold">پنل مدیریت</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{adminName}</p>
        </div>
        {nav}
        <div className="mt-auto space-y-1 border-t border-[var(--glass-border)] p-3">
          <CompleteProfileButton variant="menu" />
          <Button variant="ghost" className="w-full justify-start" onClick={logout}>
            <LogOut size={16} /> خروج
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass sticky top-0 z-20 flex items-center justify-between rounded-none border-x-0 border-t-0 px-4 py-3 md:hidden">
          <div>
            <p className="text-xs text-[var(--text-muted)]">پنل ادمین صفادارو</p>
            <p className="font-semibold">{adminName}</p>
          </div>
          <button
            type="button"
            className="rounded-xl p-2 hover:bg-white/5"
            onClick={() => setOpen((v) => !v)}
            aria-label="باز و بسته کردن منو"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>
        {open && (
          <div className="glass mx-3 mt-3 rounded-2xl md:hidden">
            {nav}
            <div className="space-y-1 border-t border-[var(--glass-border)] p-3">
              <CompleteProfileButton variant="menu" />
              <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                <LogOut size={16} /> خروج
              </Button>
            </div>
          </div>
        )}
        <main className="flex-1 p-4 md:p-0 md:pt-0 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
