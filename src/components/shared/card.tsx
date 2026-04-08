import { cn } from "@/lib/utils/cn";

export function Card({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("rounded-lg border border-slate-200 bg-white p-6", className)}>{children}</div>;
}

export function CardTitle({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <h3 className={cn("text-lg font-semibold text-slate-900", className)}>{children}</h3>;
}

export function CardDescription({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <p className={cn("text-sm leading-relaxed text-slate-600", className)}>{children}</p>;
}
