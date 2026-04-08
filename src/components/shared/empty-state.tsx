import Link from "next/link";

import { Button } from "@/components/shared/button";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {actionHref && actionLabel ? (
        <div className="mt-4">
          <Link href={actionHref}>
            <Button variant="secondary">{actionLabel}</Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
