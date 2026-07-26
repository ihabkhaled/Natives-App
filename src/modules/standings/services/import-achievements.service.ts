import { requestImportAchievements } from '../gateways/achievements.gateway';
import { runStandingsRequest } from '../helpers/to-standings-error.helper';
import { mapImportReport } from '../mappers/achievements.mapper';
import type {
  AchievementImportReport,
  ImportAchievementsCommand,
} from '../types/achievements.types';

/** Use case: one audited import run — dry-run first, then the real write. */
export function importAchievements(
  teamId: string,
  command: ImportAchievementsCommand,
): Promise<AchievementImportReport> {
  return runStandingsRequest(async () =>
    mapImportReport(await requestImportAchievements(teamId, command)),
  );
}
