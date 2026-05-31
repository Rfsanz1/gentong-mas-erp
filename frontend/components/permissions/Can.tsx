'use client';

import { ReactNode } from 'react';
import { usePermission } from '@/hooks/usePermission';

type CanProps = {
  permission: string;
  fallback?: ReactNode;
  children: ReactNode;
};

type CanAnyProps = {
  permissions: string[];
  fallback?: ReactNode;
  children: ReactNode;
};

type CanAllProps = {
  permissions: string[];
  fallback?: ReactNode;
  children: ReactNode;
};

export function Can({ permission, fallback = null, children }: CanProps) {
  const { can } = usePermission();
  return can(permission) ? <>{children}</> : <>{fallback}</>;
}

export function CanAny({ permissions, fallback = null, children }: CanAnyProps) {
  const { canAny } = usePermission();
  return canAny(permissions) ? <>{children}</> : <>{fallback}</>;
}

export function CanAll({ permissions, fallback = null, children }: CanAllProps) {
  const { canAll } = usePermission();
  return canAll(permissions) ? <>{children}</> : <>{fallback}</>;
}
