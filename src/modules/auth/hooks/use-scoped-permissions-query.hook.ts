import { useAppQuery } from '@/packages/query';

import { buildEffectivePermissionsQueryOptions } from '../queries/effective-permissions.query';

export interface ScopedPermissionsQueryView {
  readonly permissions: readonly string[];
  readonly isLoading: boolean;
  readonly isError: boolean;
}

/** The principal's effective permissions inside the given team scope. */
export function useScopedPermissionsQuery(
  teamId: string,
  enabled: boolean,
): ScopedPermissionsQueryView {
  const query = useAppQuery<readonly string[]>(
    buildEffectivePermissionsQueryOptions(teamId, enabled),
  );
  const isEnabled = enabled && teamId !== '';
  return {
    permissions: query.data ?? [],
    isLoading: isEnabled && query.isPending,
    isError: isEnabled && query.isError,
  };
}
