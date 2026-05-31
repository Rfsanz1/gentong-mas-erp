'use client';

import { ReactNode } from 'react';

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</p>
      <p className="mt-3 text-base leading-7">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
