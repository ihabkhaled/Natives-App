import { requestTransitionAchievement } from '../gateways/achievements.gateway';
import { runStandingsRequest } from '../helpers/to-standings-error.helper';
import { mapAchievement } from '../mappers/achievements.mapper';
import type { Achievement, TransitionAchievementCommand } from '../types/achievements.types';

/** Use case: one approval move, guarded by the expected record version. */
export function transitionAchievement(
  teamId: string,
  achievementId: string,
  command: TransitionAchievementCommand,
): Promise<Achievement> {
  return runStandingsRequest(async () =>
    mapAchievement(await requestTransitionAchievement(teamId, achievementId, command)),
  );
}
