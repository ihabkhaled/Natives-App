import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { standingsQueryKeys } from '../queries/standings.keys';
import { transitionAchievement } from '../services/transition-achievement.service';
import type { Achievement, TransitionAchievementCommand } from '../types/achievements.types';
import type { StandingsMutationCallbacks } from '../types/standings-view.types';

/**
 * One approval move for one claim, carrying `expectedRecordVersion` so a
 * concurrent edit surfaces as a typed conflict instead of a silent overwrite.
 */
export function useTransitionAchievementMutation(
  teamId: string,
  achievementId: string,
  callbacks: StandingsMutationCallbacks,
): InvalidatingMutationView<TransitionAchievementCommand> {
  return useInvalidatingMutation<Achievement, TransitionAchievementCommand>({
    mutationFn: (command) => transitionAchievement(teamId, achievementId, command),
    invalidateKey: standingsQueryKeys.team(teamId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
