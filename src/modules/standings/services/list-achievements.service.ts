import { requestAchievements } from '../gateways/achievements.gateway';
import { runStandingsRequest } from '../helpers/to-standings-error.helper';
import { mapAchievementsPage } from '../mappers/achievements.mapper';
import type { AchievementsFilters, AchievementsPage } from '../types/achievements.types';

/** Use case: one bounded page of the achievements workspace. */
export function listAchievements(
  teamId: string,
  filters: AchievementsFilters,
  offset: number,
): Promise<AchievementsPage> {
  return runStandingsRequest(async () =>
    mapAchievementsPage(await requestAchievements(teamId, filters, offset)),
  );
}
