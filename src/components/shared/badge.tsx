import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "muted" | "success";
  className?: string;
}

const badgeStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-slate-900 text-white",
  muted: "bg-slate-200 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        badgeStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
