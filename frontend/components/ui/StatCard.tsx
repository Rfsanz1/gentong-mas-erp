'use client';

export function StatCard({ title, value, description }: { title: string; value: string | number; description?: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <p className="mt-4 text-3xl font-semibold text-slate-950">{value}</p>
      {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}
