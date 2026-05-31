'use client';

import { ReactNode } from 'react';

export type CrudColumn<T> = {
  key: string;
  title: string;
  render?: (item: T) => ReactNode;
};

export function CrudTable<T>({
  items,
  columns,
  emptyLabel = 'No records to display.',
}: {
  items: T[];
  columns: CrudColumn<T>[];
  emptyLabel?: string;
}) {
  if (!items.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className="px-6 py-4 font-semibold uppercase tracking-[0.18em] text-slate-500">
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.map((item, index) => (
            <tr key={index} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 align-top text-slate-700">
                  {column.render ? column.render(item) : (item as any)[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
