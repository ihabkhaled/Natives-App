import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  achievementImportPath,
  achievementPath,
  achievementTransitionPath,
  achievementsPath,
  teamHistoryPath,
} from '../constants/standings-api.constants';
import { STANDINGS_LIMITS } from '../constants/standings.constants';
import {
  achievementImportReportSchema,
  achievementResponseSchema,
  listAchievementsResponseSchema,
  teamHistoryResponseSchema,
} from '../schemas/achievements.schema';
import type {
  AchievementsFilters,
  CreateAchievementCommand,
  ImportAchievementsCommand,
  TeamHistoryFilters,
  TransitionAchievementCommand,
} from '../types/achievements.types';

type AchievementDto = SchemaOutput<typeof achievementResponseSchema>;
type AchievementsListDto = SchemaOutput<typeof listAchievementsResponseSchema>;
type ImportReportDto = SchemaOutput<typeof achievementImportReportSchema>;
type HistoryDto = SchemaOutput<typeof teamHistoryResponseSchema>;

/** One bounded achievements page for the chosen facets. */
export function requestAchievements(
  teamId: string,
  filters: AchievementsFilters,
  offset: number,
): Promise<AchievementsListDto> {
  return getAppHttpClient().get(achievementsPath(teamId), listAchievementsResponseSchema, {
    params: {
      limit: STANDINGS_LIMITS.achievementsPageSize,
      offset,
      ...(filters.status === null ? {} : { status: filters.status }),
      ...(filters.category === null ? {} : { category: filters.category }),
    },
  });
}

/** One claim with its full provenance and approval state. */
export function requestAchievement(teamId: string, achievementId: string): Promise<AchievementDto> {
  return getAppHttpClient().get(achievementPath(teamId, achievementId), achievementResponseSchema);
}

/** Create a draft claim. */
export function requestCreateAchievement(
  teamId: string,
  command: CreateAchievementCommand,
): Promise<AchievementDto> {
  return getAppHttpClient().post(achievementsPath(teamId), command, achievementResponseSchema);
}

/** Move a claim through the approval state machine, concurrency-checked. */
export function requestTransitionAchievement(
  teamId: string,
  achievementId: string,
  command: TransitionAchievementCommand,
): Promise<AchievementDto> {
  return getAppHttpClient().post(
    achievementTransitionPath(teamId, achievementId),
    command,
    achievementResponseSchema,
  );
}

/** Run the audited historical import; `dryRun` previews without writing. */
export function requestImportAchievements(
  teamId: string,
  command: ImportAchievementsCommand,
): Promise<ImportReportDto> {
  return getAppHttpClient().post(
    achievementImportPath(teamId),
    command,
    achievementImportReportSchema,
  );
}

/** The trophy cabinet page: approved, non-staff entries only. */
export function requestTeamHistory(
  teamId: string,
  filters: TeamHistoryFilters,
  offset: number,
): Promise<HistoryDto> {
  return getAppHttpClient().get(teamHistoryPath(teamId), teamHistoryResponseSchema, {
    params: {
      limit: STANDINGS_LIMITS.historyPageSize,
      offset,
      ...(filters.category === null ? {} : { category: filters.category }),
    },
  });
}
