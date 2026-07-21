import { getMatchScoreboard } from '../services/get-match-scoreboard.service';
import { getMatchStatistics } from '../services/get-match-statistics.service';
import { listMatchEvents } from '../services/list-match-events.service';
import { listMatchRulesets } from '../services/list-match-rulesets.service';
import { listMatches } from '../services/list-matches.service';
import { matchesQueryKeys } from './matches.keys';

/** Every read is disabled until a real team scope (and id) is resolved. */
function scoped(teamId: string, resourceId = 'present'): boolean {
  return teamId !== '' && resourceId !== '';
}

export function buildMatchesQueryOptions(teamId: string) {
  return {
    queryKey: matchesQueryKeys.list(teamId),
    queryFn: () => listMatches(teamId),
    enabled: scoped(teamId),
  };
}

export function buildMatchScoreboardQueryOptions(teamId: string, matchId: string) {
  return {
    queryKey: matchesQueryKeys.scoreboard(teamId, matchId),
    queryFn: () => getMatchScoreboard(teamId, matchId),
    enabled: scoped(teamId, matchId),
  };
}

export function buildMatchEventsQueryOptions(teamId: string, matchId: string) {
  return {
    queryKey: matchesQueryKeys.events(teamId, matchId),
    queryFn: () => listMatchEvents(teamId, matchId),
    enabled: scoped(teamId, matchId),
  };
}

export function buildMatchStatisticsQueryOptions(teamId: string, matchId: string) {
  return {
    queryKey: matchesQueryKeys.statistics(teamId, matchId),
    queryFn: () => getMatchStatistics(teamId, matchId),
    enabled: scoped(teamId, matchId),
  };
}

export function buildMatchRulesetsQueryOptions(teamId: string) {
  return {
    queryKey: matchesQueryKeys.rulesets(teamId),
    queryFn: () => listMatchRulesets(teamId),
    enabled: scoped(teamId),
  };
}
