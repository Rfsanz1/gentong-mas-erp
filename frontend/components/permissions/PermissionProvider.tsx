'use client';

import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useAuthStore } from '@/store/auth.store';

export type PermissionContextValue = {
  isAuthenticated: boolean;
  roles: string[];
  permissions: string[];
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  can: (permission: string) => boolean;
  canAny: (permissions: string[]) => boolean;
  canAll: (permissions: string[]) => boolean;
};

const PermissionContext = createContext<PermissionContextValue | null>(null);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const roles = useMemo(() => user?.roles?.map((role) => role.toLowerCase()) ?? [], [user?.roles]);
  const permissions = useMemo(() => user?.permissions?.map((permission) => permission.toLowerCase()) ?? [], [user?.permissions]);

  const value = useMemo<PermissionContextValue>(
    () => ({
      isAuthenticated,
      roles,
      permissions,
      hasRole: (role: string) => roles.includes(role.toLowerCase()),
      hasAnyRole: (expectedRoles: string[]) => expectedRoles.some((role) => roles.includes(role.toLowerCase())),
      hasAllRoles: (expectedRoles: string[]) => expectedRoles.every((role) => roles.includes(role.toLowerCase())),
      can: (permission: string) => permissions.includes(permission.toLowerCase()),
      canAny: (expectedPermissions: string[]) => expectedPermissions.some((permission) => permissions.includes(permission.toLowerCase())),
      canAll: (expectedPermissions: string[]) => expectedPermissions.every((permission) => permissions.includes(permission.toLowerCase())),
    }),
    [isAuthenticated, permissions, roles],
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissionContext() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissionContext must be used inside PermissionProvider');
  }
  return context;
}
