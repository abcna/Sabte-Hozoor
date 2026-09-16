import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export function Select({ className, label, children, id, ...props }: Props) {
  const selectId = id || props.name;
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label && (
        <span className="text-[var(--text-secondary)] font-medium">{label}</span>
      )}
      <select
        id={selectId}
        className={cn(
          "h-11 rounded-xl px-3.5 text-base text-[var(--text-primary)]",
          "bg-[#0d1424] border border-[var(--glass-border)]",
          "outline-none transition-shadow duration-200",
          "focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/25",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
