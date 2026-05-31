import Link from 'next/link';

export default function ComingSoonPage({ searchParams }: { searchParams?: { section?: string } }) {
  const section = searchParams?.section ?? 'This module';

  return (
    <div className="mx-auto max-w-4xl py-20 px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Coming Soon</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{section} is under active development</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Thanks for exploring the new ERP shell. This area will be available once the module scaffolding and permissions are ready.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/dashboard" className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Return to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
