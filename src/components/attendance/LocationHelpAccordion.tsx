"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/cn";

export function LocationHelpAccordion() {
  const [open, setOpen] = useState(false);

  return (
    <GlassCard className="mt-4 overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-right"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold">مشکل دسترسی لوکیشن دارید؟</span>
        <ChevronDown
          size={18}
          className={cn(
            "shrink-0 text-[var(--text-muted)] transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-[var(--glass-border)] px-4 pb-4 pt-3">
            <p className="text-sm leading-7 text-[var(--text-secondary)]">
              برای ثبت حضور، دسترسی موقعیت مکانی و دوربین مرورگر باید فعال باشد.
              راهنمای فعال‌سازی را در ادامه ببینید.
            </p>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                فعال‌سازی دسترسی در اندروید
              </h3>
              <ol className="list-decimal space-y-1.5 pr-5 text-sm leading-7 text-[var(--text-secondary)]">
                <li>مرورگر Chrome یا مرورگر پیش‌فرض را باز کنید.</li>
                <li>روی آیکون قفل یا اطلاعات کنار آدرس سایت بزنید.</li>
                <li>گزینهٔ Permissions / دسترسی‌ها را باز کنید.</li>
                <li>
                  Location (موقعیت) و Camera (دوربین) را روی Allow بگذارید.
                </li>
                <li>
                  اگر قبلاً رد کرده‌اید: Settings گوشی ← Apps ← مرورگر ←
                  Permissions و هر دو را فعال کنید، سپس صفحه را رفرش کنید.
                </li>
              </ol>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                فعال‌سازی دسترسی در iOS (آیفون)
              </h3>
              <ol className="list-decimal space-y-1.5 pr-5 text-sm leading-7 text-[var(--text-secondary)]">
                <li>سایت را در Safari باز کنید.</li>
                <li>
                  وقتی مرورگر اجازه خواست، برای Location و Camera گزینهٔ Allow را
                  بزنید.
                </li>
                <li>
                  اگر قبلاً رد شده: Settings گوشی ← Safari ← Camera و Location را
                  روی Allow بگذارید.
                </li>
                <li>
                  یا Settings ← Privacy &amp; Security ← Location Services /
                  Camera و برای Safari دسترسی را فعال کنید.
                </li>
                <li>
                  صفحه را ببندید و دوباره باز کنید، سپس ورود را امتحان کنید.
                </li>
              </ol>
            </div>

            <p className="rounded-xl border border-[var(--accent)]/25 bg-[var(--accent)]/10 px-3 py-2.5 text-sm leading-7 text-[var(--text-primary)]">
              در صورتی که باز هم موفق نشدید با خانم زاهدی تماس بگیرید:{" "}
              <a
                href="tel:09222676191"
                className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
                dir="ltr"
              >
                09222676191
              </a>
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
