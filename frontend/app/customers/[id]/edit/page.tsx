'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getCustomer, updateCustomer } from '@/lib/customers';

const formatCurrency = (value: number | string | null | undefined) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function EditCustomerPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [npwp, setNpwp] = useState('');
  const [creditLimit, setCreditLimit] = useState(0);
  const [active, setActive] = useState(true);

  const customerQuery = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id),
    enabled: Boolean(id),
  });

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof updateCustomer>[1]) => updateCustomer(id, data),
    onSuccess: () => {
      router.push(`/customers/${id}`);
    },
  });

  useEffect(() => {
    if (!customerQuery.data) return;
    setName(customerQuery.data.name ?? '');
    setEmail(customerQuery.data.email ?? '');
    setPhone(customerQuery.data.phone ?? '');
    setAddress(customerQuery.data.address ?? '');
    setCity(customerQuery.data.city ?? '');
    setProvince(customerQuery.data.province ?? '');
    setNpwp(customerQuery.data.npwp ?? '');
    setCreditLimit(Number(customerQuery.data.creditLimit ?? 0));
    setActive(Boolean(customerQuery.data.active));
  }, [customerQuery.data]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      province: province.trim() || undefined,
      npwp: npwp.trim() || undefined,
      creditLimit: creditLimit ?? 0,
      active,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-950">Edit Customer</h1>
              <p className="mt-1 text-sm text-slate-500">Update customer details and credit settings.</p>
            </div>
            <Link href={`/customers/${id}`} className="text-sm font-semibold text-slate-700 hover:text-slate-900">
              Back to detail
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
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
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Phone
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              NPWP
              <input
                value={npwp}
                onChange={(event) => setNpwp(event.target.value)}
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
            <label className="space-y-2 text-sm font-medium text-slate-700">
              City
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Province
              <input
                value={province}
                onChange={(event) => setProvince(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Credit limit
              <input
                type="number"
                min={0}
                value={creditLimit}
                onChange={(event) => setCreditLimit(Number(event.target.value))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500"
              />
              <p className="text-xs text-slate-500">{formatCurrency(creditLimit)}</p>
            </label>
          </div>

          <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            Active customer
          </label>

          {mutation.isError ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {mutation.error instanceof Error ? mutation.error.message : 'Unable to save changes.'}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href={`/customers/${id}`}
              className="inline-flex justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={mutation.status === 'pending' || customerQuery.isLoading}
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
