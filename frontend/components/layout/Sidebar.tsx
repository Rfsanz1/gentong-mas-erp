'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { usePermission } from '@/hooks/usePermission';
import type { NavGroup } from '@/config/navigation';

type SidebarProps = {
  navigation: NavGroup[];
  onClose?: () => void;
};

const normalizePath = (href: string) => href.split('?')[0];

export default function Sidebar({ navigation, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { hasAnyRole, canAny } = usePermission();

  const isItemVisible = (item: { roles?: string[]; permissions?: string[] }) => {
    const roleMatch = item.roles ? hasAnyRole(item.roles) : true;
    const permissionMatch = item.permissions ? canAny(item.permissions) : true;
    return roleMatch && permissionMatch;
  };

  return (
    <aside className="hidden lg:flex lg:w-80 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-slate-950 lg:text-slate-100 lg:shadow-sm">
      <div className="flex h-20 items-center px-6 text-lg font-semibold tracking-tight text-white">
        Gentong Mas ERP
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {navigation.map((group) => {
          const visibleItems = group.items.filter(isItemVisible);
          if (!visibleItems.length) return null;
          return (
            <div key={group.title} className="mb-6">
              <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {group.title}
              </div>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const path = normalizePath(item.href);
                  const active = path === '/' ? pathname === '/' : pathname.startsWith(path);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={clsx(
                        'block rounded-xl px-4 py-3 transition-colors',
                        active
                          ? 'bg-slate-100 text-slate-950 shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                      )}
                    >
                      <div className="font-medium">{item.title}</div>
                      <p className="mt-1 truncate text-sm text-slate-400">{item.description}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
