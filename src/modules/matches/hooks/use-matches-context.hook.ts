import { useActiveTeamScope, useCurrentUserQuery, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';

import {
  canFinalizeMatch,
  canReadMatchAnalysis,
  canReadMatchStatistics,
  canReadMatches,
  canScoreMatch,
} from '../helpers/matches-permission.helper';
import type { MatchesContextView } from '../types/matches-view.types';

/**
 * The team scope, signed-in user id, effective grants, and connectivity every
 * match screen needs. The user id is load-bearing: the offline scorekeeper
 * queue is owned per account, so an account switch must not read or submit the
 * previous scorekeeper's unsent points.
 */
export function useMatchesContext(): MatchesContextView {
  const scope = useActiveTeamScope();
  const currentUser = useCurrentUserQuery();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();
  return {
    teamId: scope.teamId,
    userId: currentUser.user?.id ?? '',
    isOffline: !network.isOnline,
    canReadMatches: canReadMatches(permissions.permissions),
    canScoreMatch: canScoreMatch(permissions.permissions),
    canFinalizeMatch: canFinalizeMatch(permissions.permissions),
    canReadStatistics: canReadMatchStatistics(permissions.permissions),
    canReadAnalysis: canReadMatchAnalysis(permissions.permissions),
    isLoading: scope.isLoading || permissions.isLoading || currentUser.isLoading,
  };
}
