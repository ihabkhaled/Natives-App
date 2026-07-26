import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { hasAllPermissions, PERMISSIONS } from '@/shared/security';

export interface ReportsContextView {
  readonly teamId: string;
  readonly isOffline: boolean;
  readonly canRead: boolean;
  readonly canGenerate: boolean;
  readonly isLoading: boolean;
}

/**
 * The team scope, effective grants, and connectivity the reports center
 * needs. Listing is report.read; requesting, retrying, and downloading are
 * report.generate — a hypothetical read-only grant sees the list without the
 * action buttons. The backend re-authorizes every call.
 */
export function useReportsContext(): ReportsContextView {
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const granted = permissions.permissions;
  const network = useNetworkStatus();
  return {
    teamId: scope.teamId,
    isOffline: !network.isOnline,
    canRead: hasAllPermissions(granted, [PERMISSIONS.reportsRead]),
    canGenerate: hasAllPermissions(granted, [PERMISSIONS.reportsGenerate]),
    isLoading: scope.isLoading || permissions.isLoading,
  };
}
