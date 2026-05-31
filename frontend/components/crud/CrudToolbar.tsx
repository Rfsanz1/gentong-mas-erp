'use client';

import { ReactNode } from 'react';

export function CrudToolbar({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
