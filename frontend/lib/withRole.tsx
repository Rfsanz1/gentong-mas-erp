'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, resolveRedirect } from '@/store/auth.store';

export function useRoleGuard(allowedRoles: string[]) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const role = user?.role?.toLowerCase() ?? '';
    const allowed = allowedRoles.map((r) => r.toLowerCase());
    if (!allowed.includes(role)) {
      router.replace(resolveRedirect(role));
    }
  }, [isAuthenticated, user, router]);
}
