'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getCustomer, removeCustomer } from '@/lib/customers';
import { queryClient } from '@/lib/query-client';
import { usePermission } from '@/hooks/usePermission';

const formatCurrency = (value: string | number | null | undefined) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { canAny, hasAnyRole } = usePermission();
  const canUpdateCustomer = canAny(['customers.update']) || hasAnyRole(['admin', 'owner', 'super admin', 'sales', 'sales manager', 'kasir']);
  const canDeleteCustomer = canAny(['customers.delete']) || hasAnyRole(['admin', 'owner', 'super admin', 'sales', 'sales manager', 'kasir']);

  const customerQuery = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id),
    enabled: Boolean(id),
  });

  const deleteMutation = useMutation({
    mutationFn: removeCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      router.push('/customers');
    },
  });

  const customer = customerQuery.data;

  const statusLabel = useMemo(() => {
    if (!customer) return 'Unknown';
    return customer.active ? 'Active' : 'Inactive';
  }, [customer]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-950">Customer details</h1>
              <p className="mt-1 text-sm text-slate-500">View customer profile, credit data, and recent order activity.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/customers" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Back
              </Link>
              {canUpdateCustomer ? (
                <Link
                  href={`/customers/${id}/edit`}
                  className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Edit
                </Link>
              ) : null}
              {canDeleteCustomer && customer?.active ? (
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(id)}
                  disabled={deleteMutation.status === 'pending'}
                  className="rounded-2xl bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Deactivate
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {customerQuery.isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Loading customer details...</p>
          </div>
        ) : customer ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Customer</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{customer.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Status</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{statusLabel}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Credit used</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{formatCurrency(customer.creditUsed)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Profile</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Email</p>
                  <p className="text-sm text-slate-900">{customer.email ?? 'Not set'}</p>
                </div>
                <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Phone</p>
                  <p className="text-sm text-slate-900">{customer.phone ?? 'Not set'}</p>
                </div>
                <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">NPWP</p>
                  <p className="text-sm text-slate-900">{customer.npwp ?? 'Not set'}</p>
                </div>
                <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Address</p>
                  <p className="text-sm text-slate-900">{customer.address ?? 'Not set'}</p>
                </div>
                <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">City</p>
                  <p className="text-sm text-slate-900">{customer.city ?? 'Not set'}</p>
                </div>
                <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Province</p>
                  <p className="text-sm text-slate-900">{customer.province ?? 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Recent orders</h2>
                  <p className="mt-1 text-sm text-slate-500">Latest sales and order history linked to this customer.</p>
                </div>
              </div>

              {customer.orders?.length ? (
                <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="px-4 py-3 font-semibold uppercase tracking-[0.15em]">Order</th>
                        <th className="px-4 py-3 font-semibold uppercase tracking-[0.15em]">Status</th>
                        <th className="px-4 py-3 font-semibold uppercase tracking-[0.15em]">Total</th>
                        <th className="px-4 py-3 font-semibold uppercase tracking-[0.15em]">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {customer.orders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50">
                          <td className="px-4 py-4 text-slate-900">#{order.id}</td>
                          <td className="px-4 py-4 text-slate-700">{order.status}</td>
                          <td className="px-4 py-4 text-slate-700">{formatCurrency(order.totalHarga)}</td>
                          <td className="px-4 py-4 text-slate-700">{new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No recent orders found for this customer.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Customer not found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
