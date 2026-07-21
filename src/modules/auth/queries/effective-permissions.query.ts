import { getEffectivePermissions } from '../services/get-effective-permissions.service';
import { authQueryKeys } from './auth.keys';

/**
 * Query options for the principal's permissions in one team scope. Disabled
 * until the scope resolves: a request without a team id can only answer with
 * global grants, which is precisely the wrong answer.
 */
export function buildEffectivePermissionsQueryOptions(teamId: string, enabled: boolean) {
  return {
    queryKey: authQueryKeys.effectivePermissions(teamId),
    queryFn: () => getEffectivePermissions(teamId),
    enabled: enabled && teamId !== '',
  };
}
