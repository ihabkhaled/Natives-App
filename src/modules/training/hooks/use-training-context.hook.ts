import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';

import {
  canReadOwnTraining,
  canReviewTraining,
  canSubmitTraining,
} from '../helpers/submission-workflow.helper';
import type { TrainingContextView } from '../types/training-view.types';

/**
 * The team scope, effective grants, and connectivity every training screen
 * needs. Resolved from the real membership the identity endpoints return, so
 * a team-scoped screen loads the moment a membership exists.
 */
export function useTrainingContext(): TrainingContextView {
  const scope = useActiveTeamScope();
  const permissions = useEffectivePermissions();
  const network = useNetworkStatus();
  return {
    teamId: scope.teamId,
    membershipId: scope.membershipId,
    isOffline: !network.isOnline,
    canRead: canReadOwnTraining(permissions.permissions),
    canSubmit: canSubmitTraining(permissions.permissions),
    canReview: canReviewTraining(permissions.permissions),
    isLoading: scope.isLoading || permissions.isLoading,
  };
}
