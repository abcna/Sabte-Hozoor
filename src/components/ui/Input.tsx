import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ className, label, error, id, ...props }: Props) {
  const inputId = id || props.name;
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label && (
        <span className="text-[var(--text-secondary)] font-medium">{label}</span>
      )}
      <input
        id={inputId}
        className={cn(
          "h-11 rounded-xl px-3.5 text-base text-[var(--text-primary)]",
          "bg-white/5 border border-[var(--glass-border)]",
          "placeholder:text-[var(--text-muted)]",
          "outline-none transition-shadow duration-200",
          "focus:border-[var(--accent)]/50 focus:ring-2 focus:ring-[var(--accent)]/25",
          error && "border-[var(--danger)]/60",
          className,
        )}
        {...props}
      />
      {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
    </label>
  );
}
