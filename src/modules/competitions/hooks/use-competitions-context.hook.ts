import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';

import {
  canManageCompetitions,
  canManageSquads,
  canOverrideEligibility,
  canLockRoster,
  canManageRoster,
  canReadCompetitions,
  canReadRoster,
  canReadSquads,
} from '../helpers/competitions-permission.helper';
import type { CompetitionsContextView } from '../types/competitions-view.types';

/**
 * The team scope, effective grants, and connectivity every competitions and
 * squad screen needs. Grants gate convenience UI only; the backend
 * re-authorizes every read, selection, override, and transition.
 */
export function useCompetitionsContext(): CompetitionsContextView {
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();
  return {
    teamId: scope.teamId,
    membershipId: scope.membershipId,
    isOffline: !network.isOnline,
    canReadCompetitions: canReadCompetitions(permissions.permissions),
    canManageCompetitions: canManageCompetitions(permissions.permissions),
    canReadSquads: canReadSquads(permissions.permissions),
    canManageSquads: canManageSquads(permissions.permissions),
    canOverrideEligibility: canOverrideEligibility(permissions.permissions),
    canReadRoster: canReadRoster(permissions.permissions),
    canManageRoster: canManageRoster(permissions.permissions),
    canLockRoster: canLockRoster(permissions.permissions),
    isLoading: scope.isLoading || permissions.isLoading,
  };
}
