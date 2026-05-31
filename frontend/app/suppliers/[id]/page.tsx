'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getSupplier, removeSupplier, Supplier } from '@/lib/suppliers';
import { queryClient } from '@/lib/query-client';
import { usePermission } from '@/hooks/usePermission';

export default function SupplierDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { canAny, hasAnyRole } = usePermission();
  const canUpdateSupplier = canAny(['suppliers.update']) || hasAnyRole(['admin', 'owner', 'super admin', 'sales manager']);
  const canDeleteSupplier = canAny(['suppliers.delete']) || hasAnyRole(['admin', 'owner', 'super admin', 'sales manager']);

  const supplierQuery = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => getSupplier(id),
    enabled: Boolean(id),
  });

  const deleteMutation = useMutation({
    mutationFn: removeSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      router.push('/suppliers');
    },
  });

  const supplier = supplierQuery.data as Supplier | undefined;
  const statusLabel = useMemo(() => {
    if (!supplier) return 'Unknown';
    return supplier.active ? 'Active' : 'Inactive';
  }, [supplier]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-950">Supplier details</h1>
              <p className="mt-1 text-sm text-slate-500">View and manage supplier contact information.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/suppliers" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Back
              </Link>
              {canUpdateSupplier ? (
                <Link
                  href={`/suppliers/${id}/edit`}
                  className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Edit
                </Link>
              ) : null}
              {canDeleteSupplier && supplier?.active ? (
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

        {supplierQuery.isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Loading supplier details...</p>
          </div>
        ) : supplier ? (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Supplier</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{supplier.name}</p>
                  <p className="mt-1 text-sm text-slate-500">Code: {supplier.code}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Status</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{statusLabel}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Contact person</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{supplier.contactPerson ?? 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Profile</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Email</p>
                  <p className="text-sm text-slate-900">{supplier.email ?? 'Not set'}</p>
                </div>
                <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Phone</p>
                  <p className="text-sm text-slate-900">{supplier.phone ?? 'Not set'}</p>
                </div>
                <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Address</p>
                  <p className="text-sm text-slate-900">{supplier.address ?? 'Not set'}</p>
                </div>
                <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Created</p>
                  <p className="text-sm text-slate-900">{new Date(supplier.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="space-y-1 rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Last updated</p>
                  <p className="text-sm text-slate-900">{new Date(supplier.updatedAt).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Supplier not found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
