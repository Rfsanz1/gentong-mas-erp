'use client';

import { usePermissionContext } from '@/components/permissions/PermissionProvider';

export function useRole() {
  const { roles, hasRole, hasAnyRole, hasAllRoles } = usePermissionContext();
  return { roles, hasRole, hasAnyRole, hasAllRoles };
}
