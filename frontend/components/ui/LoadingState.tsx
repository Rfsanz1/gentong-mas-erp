'use client';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-700" />
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{label}</p>
    </div>
  );
}
