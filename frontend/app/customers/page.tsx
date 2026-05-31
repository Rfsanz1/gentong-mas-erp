'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@tanstack/react-query';
import { usePermission } from '@/hooks/usePermission';
import { queryClient } from '@/lib/query-client';
import { getCustomers, removeCustomer } from '@/lib/customers';

const formatCurrency = (value: string | number | null | undefined) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);

  const { canAny, hasAnyRole } = usePermission();
  const canCreateCustomer = canAny(['customers.create']) || hasAnyRole(['admin', 'owner', 'super admin', 'sales', 'sales manager', 'kasir']);
  const canUpdateCustomer = canAny(['customers.update']) || hasAnyRole(['admin', 'owner', 'super admin', 'sales', 'sales manager', 'kasir']);
  const canDeleteCustomer = canAny(['customers.delete']) || hasAnyRole(['admin', 'owner', 'super admin', 'sales', 'sales manager', 'kasir']);

  const activeParam = activeFilter === 'all' ? undefined : activeFilter === 'active' ? 'true' : 'false';

  const customersQuery = useQuery({
    queryKey: ['customers', search, activeFilter, page],
    queryFn: () => getCustomers({ search: search.trim() || undefined, active: activeParam, page, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: removeCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const items = customersQuery.data?.data ?? [];
  const totalPages = customersQuery.data?.totalPages ?? 1;

  const statusLabel = useMemo(() => {
    if (activeFilter === 'active') return 'Active';
    if (activeFilter === 'inactive') return 'Inactive';
    return 'All customers';
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Customers</h1>
            <p className="mt-1 text-sm text-slate-500">Manage customer records, credit data, and recent order activity.</p>
          </div>
          {canCreateCustomer ? (
            <Link
              href="/customers/new"
              className="inline-flex items-center justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
            >
              Add Customer
            </Link>
          ) : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {(['all', 'active', 'inactive'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setActiveFilter(option);
                      setPage(1);
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      activeFilter === option ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {option === 'all' ? 'All' : option === 'active' ? 'Active' : 'Inactive'}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 focus-within:border-sky-500 focus-within:outline-none sm:w-auto">
                  <span className="text-slate-500">Search</span>
                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Name, email, phone"
                  />
                </label>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.15em]">Name</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.15em]">Phone</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.15em]">City</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.15em]">Credit</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.15em]">Status</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.15em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {customersQuery.isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-20 text-center text-sm text-slate-500">
                        Loading customers...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-20 text-center text-sm text-slate-500">
                        No customers found for {statusLabel.toLowerCase()}.
                      </td>
                    </tr>
                  ) : (
                    items.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-50">
                        <td className="px-4 py-4">
                          <Link href={`/customers/${customer.id}`} className="font-medium text-slate-900 hover:text-sky-600">
                            {customer.name}
                          </Link>
                          <p className="mt-1 text-xs text-slate-500">{customer.email ?? 'No email'}</p>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{customer.phone ?? '-'}</td>
                        <td className="px-4 py-4 text-slate-700">{customer.city ?? '-'}</td>
                        <td className="px-4 py-4 text-slate-700">
                          <div className="text-sm font-medium text-slate-900">{formatCurrency(customer.creditUsed)}</div>
                          <div className="text-xs text-slate-500">of {formatCurrency(customer.creditLimit)}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              customer.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {customer.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {canUpdateCustomer ? (
                              <Link
                                href={`/customers/${customer.id}/edit`}
                                className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                              >
                                Edit
                              </Link>
                            ) : null}
                            {canDeleteCustomer && customer.active ? (
                              <button
                                type="button"
                                onClick={() => deleteMutation.mutate(customer.id)}
                                disabled={deleteMutation.status === 'pending'}
                                className="rounded-2xl bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Deactivate
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing {items.length} of {customersQuery.data?.total ?? 0} customers
              </p>
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.max(value - 1, 1))}
                  disabled={page <= 1 || customersQuery.isFetching}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600">
                  Page {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.min(value + 1, totalPages))}
                  disabled={page >= totalPages || customersQuery.isFetching}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-950">Customer controls</h2>
              <p className="mt-2 text-sm text-slate-500">Use the customer list to view, edit, and soft deactivate customer records.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">Help</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Search by name, email, or phone. Toggle active/inactive state to narrow the customer list. Edit or deactivate records from the actions menu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
