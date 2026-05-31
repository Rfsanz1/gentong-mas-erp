'use client';

export function Badge({ label }: { label: string }) {
  return <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">{label}</span>;
}
