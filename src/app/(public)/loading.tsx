export default function PublicLoading() {
  return (
    <div className="space-y-6" aria-live="polite" aria-busy="true">
      <div className="h-10 w-2/3 animate-pulse rounded-md bg-slate-200" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-36 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-36 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-36 animate-pulse rounded-lg bg-slate-200" />
      </div>
      <div className="h-8 w-1/2 animate-pulse rounded-md bg-slate-200" />
      <div className="space-y-3">
        <div className="h-24 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-24 animate-pulse rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}
