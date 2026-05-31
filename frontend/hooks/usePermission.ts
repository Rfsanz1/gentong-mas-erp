'use client';

import { usePermissionContext } from '@/components/permissions/PermissionProvider';

export function usePermission() {
  return usePermissionContext();
}
