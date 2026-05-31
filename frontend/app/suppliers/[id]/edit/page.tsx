'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getSupplier, updateSupplier } from '@/lib/suppliers';

export default function EditSupplierPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  const supplierQuery = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => getSupplier(id),
    enabled: Boolean(id),
  });

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof updateSupplier>[1]) => updateSupplier(id, data),
    onSuccess: () => {
      router.push(`/suppliers/${id}`);
    },
  });

  useEffect(() => {
    if (!supplierQuery.data) return;
    setName(supplierQuery.data.name ?? '');
    setEmail(supplierQuery.data.email ?? '');
    setPhone(supplierQuery.data.phone ?? '');
    setAddress(supplierQuery.data.address ?? '');
    setContactPerson(supplierQuery.data.contactPerson ?? '');
  }, [supplierQuery.data]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      contactPerson: contactPerson.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-950">Edit Supplier</h1>
              <p className="mt-1 text-sm text-slate-500">Update supplier contact and address details.</p>
            </div>
            <Link href={`/suppliers/${id}`} className="text-sm font-semibold text-slate-700 hover:text-slate-900">
              Back to detail
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Contact person
              <input
                value={contactPerson}
                onChange={(event) => setContactPerson(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Phone
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
              Address
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500"
              />
            </label>
          </div>

          {mutation.isError ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {mutation.error instanceof Error ? mutation.error.message : 'Unable to save changes.'}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href={`/suppliers/${id}`}
              className="inline-flex justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={mutation.status === 'pending' || supplierQuery.isLoading}
              className="inline-flex justify-center rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.status === 'pending' ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
