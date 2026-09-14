import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  strong?: boolean;
};

export function GlassCard({ className, strong, children, ...props }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--glass-border)] shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
        "backdrop-blur-[var(--glass-blur)]",
        strong ? "bg-[var(--glass-bg-strong)]" : "bg-[var(--glass-bg)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
