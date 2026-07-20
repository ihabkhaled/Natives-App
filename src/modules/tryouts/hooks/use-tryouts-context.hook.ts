import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';

import {
  canConvertTryouts,
  canDecideTryouts,
  canEvaluateTryouts,
  canManageTryouts,
  canReadTryoutContacts,
  canReadTryoutReadiness,
} from '../helpers/tryouts-permission.helper';
import type { TryoutsContextView } from '../types/tryouts-view.types';

/**
 * The team scope, effective grants, and connectivity every staff tryout
 * screen needs. Contact and readiness grants are resolved here so a screen
 * never has to reason about permission strings itself.
 */
export function useTryoutsContext(): TryoutsContextView {
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();
  return {
    teamId: scope.teamId,
    isOffline: !network.isOnline,
    canManage: canManageTryouts(permissions.permissions),
    canReadContacts: canReadTryoutContacts(permissions.permissions),
    canReadReadiness: canReadTryoutReadiness(permissions.permissions),
    canEvaluate: canEvaluateTryouts(permissions.permissions),
    canDecide: canDecideTryouts(permissions.permissions),
    canConvert: canConvertTryouts(permissions.permissions),
    isLoading: scope.isLoading || permissions.isLoading,
  };
}
