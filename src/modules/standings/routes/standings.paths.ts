import { APP_PATHS } from '@/shared/config';

/** Route pattern and navigation target for the standings table. */
export function standingsPagePath(): string {
  return APP_PATHS.standings;
}

/** Route pattern and navigation target for the versioned point rules. */
export function standingsRulesPagePath(): string {
  return APP_PATHS.standingsRules;
}

/** Route pattern and navigation target for the achievements workspace. */
export function achievementsPagePath(): string {
  return APP_PATHS.achievements;
}

/** Route pattern and navigation target for the trophy cabinet. */
export function teamHistoryPagePath(): string {
  return APP_PATHS.teamHistory;
}
