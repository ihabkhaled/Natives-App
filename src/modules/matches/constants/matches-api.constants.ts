/**
 * NestJS matches-module paths, relative to the versioned API base URL.
 * Every path is team-scoped: the backend re-authorizes team membership,
 * season scope, and the match.score / match.stats.read grants on each call.
 */
function teamPath(teamId: string, suffix: string): string {
  return `/teams/${encodeURIComponent(teamId)}${suffix}`;
}

export function matchesPath(teamId: string): string {
  return teamPath(teamId, '/matches');
}

export function matchPath(teamId: string, matchId: string): string {
  return `${matchesPath(teamId)}/${encodeURIComponent(matchId)}`;
}

export function matchScoreboardPath(teamId: string, matchId: string): string {
  return `${matchPath(teamId, matchId)}/scoreboard`;
}

export function matchEventsPath(teamId: string, matchId: string): string {
  return `${matchPath(teamId, matchId)}/events`;
}

export function matchPointPath(teamId: string, matchId: string): string {
  return `${matchEventsPath(teamId, matchId)}/point`;
}

export function matchTimeoutPath(teamId: string, matchId: string): string {
  return `${matchEventsPath(teamId, matchId)}/timeout`;
}

export function matchVoidPath(teamId: string, matchId: string): string {
  return `${matchEventsPath(teamId, matchId)}/void`;
}

export function matchTransitionPath(teamId: string, matchId: string): string {
  return `${matchPath(teamId, matchId)}/transition`;
}

export function matchFinalizationPath(teamId: string, matchId: string): string {
  return `${matchPath(teamId, matchId)}/finalization`;
}

export function matchRulesetsPath(teamId: string): string {
  return teamPath(teamId, '/match-rulesets');
}

/** Derived per-team and per-player statistics (backend 504). */
export function matchStatisticsPath(teamId: string, matchId: string): string {
  return `${matchPath(teamId, matchId)}/statistics`;
}

/** The endpoint each queued scorekeeper command is delivered to. */
export const SCOREKEEPER_PATH_BY_KIND = {
  point: matchPointPath,
  timeout: matchTimeoutPath,
  void: matchVoidPath,
} as const;
