import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "md" | "lg" | "sm";
  loading?: boolean;
  children?: ReactNode;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  type = "button",
  children,
  ...props
}: Props) {
  const variants = {
    primary:
      "bg-[var(--accent)] text-[#042f2e] hover:bg-[var(--accent-strong)] shadow-[0_8px_24px_rgba(45,212,191,0.25)]",
    secondary:
      "bg-[var(--glass-bg-strong)] text-[var(--text-primary)] border border-[var(--glass-border)] hover:bg-white/15",
    danger:
      "bg-[var(--danger)]/90 text-white hover:bg-[var(--danger)]",
    ghost:
      "bg-transparent text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm rounded-xl",
    md: "h-11 px-4 text-sm rounded-xl",
    lg: "h-14 px-6 text-base rounded-2xl min-w-[200px]",
  };

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]",
        "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
        variants[variant],
        sizes[size],
        loading && "animate-pulse",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "لطفاً صبر کنید…" : children}
    </button>
  );
}
