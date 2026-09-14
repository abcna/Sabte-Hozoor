import Link from "next/link";
import { Users, MapPin, Clock3, ClipboardList } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const cards = [
  {
    href: "/admin/users",
    title: "کاربران",
    desc: "ساخت حساب پرسنل و اختصاص لوکیشن و شیفت",
    icon: Users,
  },
  {
    href: "/admin/locations",
    title: "لوکیشن‌ها",
    desc: "مختصات داروخانه و شعاع مجاز حضور",
    icon: MapPin,
  },
  {
    href: "/admin/shifts",
    title: "شیفت‌ها",
    desc: "تعریف بازه زمانی شیفت‌های کاری",
    icon: Clock3,
  },
  {
    href: "/admin/attendance",
    title: "حضور و غیاب",
    desc: "مشاهده رکوردهای ورود و خروج",
    icon: ClipboardList,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 md:pt-0">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">داشبورد</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          مدیریت تنظیمات حضور و غیاب داروخانه
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ href, title, desc, icon: Icon }) => (
          <Link key={href} href={href}>
            <GlassCard className="h-full p-5 transition-colors hover:bg-white/10">
              <Icon className="text-[var(--accent)]" size={22} />
              <h3 className="mt-3 text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{desc}</p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
