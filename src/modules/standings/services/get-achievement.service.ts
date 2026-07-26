import { requestAchievement } from '../gateways/achievements.gateway';
import { runStandingsRequest } from '../helpers/to-standings-error.helper';
import { mapAchievement } from '../mappers/achievements.mapper';
import type { Achievement } from '../types/achievements.types';

/** Use case: one claim with its provenance and current approval state. */
export function getAchievement(teamId: string, achievementId: string): Promise<Achievement> {
  return runStandingsRequest(async () =>
    mapAchievement(await requestAchievement(teamId, achievementId)),
  );
}
