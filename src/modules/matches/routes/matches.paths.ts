import { APP_PATHS } from '@/shared/config';

export const MATCH_ID_PARAM = 'matchId';

function withMatchId(pattern: string, matchId: string): string {
  return pattern.replace(`:${MATCH_ID_PARAM}`, encodeURIComponent(matchId));
}

export function matchesPattern(): string {
  return APP_PATHS.matches;
}

export function matchesPath(): string {
  return APP_PATHS.matches;
}

export function matchScoreboardPattern(): string {
  return APP_PATHS.matchScoreboard;
}

export function matchScoreboardPath(matchId: string): string {
  return withMatchId(APP_PATHS.matchScoreboard, matchId);
}

export function matchStatisticsPattern(): string {
  return APP_PATHS.matchStatistics;
}

export function matchStatisticsPath(matchId: string): string {
  return withMatchId(APP_PATHS.matchStatistics, matchId);
}
