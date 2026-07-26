import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { standingsQueryKeys } from '../queries/standings.keys';
import { createAchievement } from '../services/create-achievement.service';
import type { Achievement, CreateAchievementCommand } from '../types/achievements.types';
import type { StandingsMutationCallbacks } from '../types/standings-view.types';

/** Author a draft claim, then refresh the workspace list. */
export function useCreateAchievementMutation(
  teamId: string,
  callbacks: StandingsMutationCallbacks,
): InvalidatingMutationView<CreateAchievementCommand> {
  return useInvalidatingMutation<Achievement, CreateAchievementCommand>({
    mutationFn: (command) => createAchievement(teamId, command),
    invalidateKey: standingsQueryKeys.team(teamId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
