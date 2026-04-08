import { cn } from "@/lib/utils/cn";

export function SectionTitle({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
      {description ? <p className="max-w-3xl text-slate-600">{description}</p> : null}
    </div>
  );
}
