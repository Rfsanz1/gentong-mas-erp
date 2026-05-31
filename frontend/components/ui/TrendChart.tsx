'use client';

import type { ReactNode } from 'react';

type TrendPoint = {
  label: string;
  value: number;
};

type TrendChartProps = {
  title: string;
  subtitle?: string;
  data: TrendPoint[];
  valueLabel?: string;
  footer?: ReactNode;
};

export function TrendChart({ title, subtitle, data, valueLabel, footer }: TrendChartProps) {
  const maxValue = Math.max(...data.map((point) => point.value), 1);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        {valueLabel ? <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">{valueLabel}</p> : null}
      </div>

      <div className="flex items-end gap-3 h-48">
        {data.map((point) => (
          <div key={point.label} className="flex flex-col items-center gap-2">
            <div
              className="w-8 rounded-full bg-slate-200 transition-all"
              style={{ height: `${(point.value / maxValue) * 100}%` }}
            />
            <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{point.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-sm text-slate-500">
        {data.map((point) => (
          <div key={point.label} className="rounded-3xl bg-slate-50 p-3">
            <p className="font-semibold text-slate-900">{point.value.toLocaleString('id-ID')}</p>
            <p className="mt-1 text-xs">{point.label}</p>
          </div>
        ))}
      </div>

      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}
