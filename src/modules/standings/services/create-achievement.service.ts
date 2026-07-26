import { requestCreateAchievement } from '../gateways/achievements.gateway';
import { runStandingsRequest } from '../helpers/to-standings-error.helper';
import { mapAchievement } from '../mappers/achievements.mapper';
import type { Achievement, CreateAchievementCommand } from '../types/achievements.types';

/** Use case: author a draft claim; approval is a separate, gated step. */
export function createAchievement(
  teamId: string,
  command: CreateAchievementCommand,
): Promise<Achievement> {
  return runStandingsRequest(async () =>
    mapAchievement(await requestCreateAchievement(teamId, command)),
  );
}
