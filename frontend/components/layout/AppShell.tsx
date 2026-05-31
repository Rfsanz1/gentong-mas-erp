'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import Sidebar from '@/components/layout/Sidebar';
import { navigationConfig } from '@/config/navigation';
import { useAuthStore } from '@/store/auth.store';
import { usePermission } from '@/hooks/usePermission';

const AUTH_ROUTES = ['/login', '/otp', '/select-tenant', '/callback'];

const getSectionTitle = (pathname: string) => {
  if (pathname === '/' || pathname === '/dashboard') return 'Dashboard';
  if (pathname.startsWith('/sales')) return 'Sales';
  if (pathname.startsWith('/pos')) return 'Point of Sale';
  if (pathname.startsWith('/gudang')) return 'Warehouse';
  if (pathname.startsWith('/coming-soon')) return 'Coming Soon';
  return pathname.replace('/', '').replace('-', ' ').replace(/\w/g, (chunk) => chunk.toUpperCase());
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { roles, permissions } = usePermission();

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const sectionTitle = useMemo(() => getSectionTitle(pathname), [pathname]);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
            >
              <span className="sr-only">Open navigation</span>
              ☰
            </button>
            <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-slate-950">
              Gentong Mas ERP
            </Link>
          </div>

          <div className="hidden lg:flex lg:items-center lg:gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
              {user?.name ?? 'Guest'} • {roles.length ? roles.join(', ') : 'No role assigned'}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:flex lg:pl-80">
        <Sidebar navigation={navigationConfig} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 px-4 pt-20 pb-12 sm:px-6 lg:px-10">
          <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Section</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{sectionTitle}</h1>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
              Permissions: {permissions.length ? permissions.join(', ') : 'None'}
            </div>
          </div>
          {children}
        </div>
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-950/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-col bg-slate-950 text-slate-100 shadow-xl">
            <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
              <span className="text-lg font-semibold">Menu</span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-xl bg-slate-900 px-3 py-2 text-slate-200 transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-4">
              {navigationConfig.map((group) => {
                const visibleItems = group.items.filter((item) => {
                  const roleMatch = item.roles ? roles.some((role) => item.roles?.includes(role)) : true;
                  const permissionMatch = item.permissions ? item.permissions.some((permission) => permissions.includes(permission)) : true;
                  return roleMatch && permissionMatch;
                });
                if (!visibleItems.length) return null;
                return (
                  <div key={group.title} className="mb-5">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {group.title}
                    </div>
                    <div className="space-y-2">
                      {visibleItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className="block rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 transition hover:bg-slate-800"
                        >
                          <div className="font-medium">{item.title}</div>
                          <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
