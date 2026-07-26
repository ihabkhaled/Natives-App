import { getTeamHistory } from '../services/get-team-history.service';
import { listAchievements } from '../services/list-achievements.service';
import { listStandings } from '../services/list-standings.service';
import { listStandingsRules } from '../services/list-standings-rules.service';
import { STANDINGS_FILTER_ALL } from '../constants/standings.constants';
import type { AchievementsFilters, TeamHistoryFilters } from '../types/achievements.types';
import type { StandingsFilters } from '../types/standings.types';
import { standingsQueryKeys } from './standings.keys';

/** Query options for one competition's server-sorted table. */
export function buildStandingsQueryOptions(teamId: string, filters: StandingsFilters) {
  return {
    queryKey: standingsQueryKeys.table(
      teamId,
      filters.competitionId,
      filters.source ?? STANDINGS_FILTER_ALL,
    ),
    queryFn: () => listStandings(teamId, filters),
    enabled: teamId !== '' && filters.competitionId !== '',
  };
}

/** Query options for the immutable rule-version catalog. */
export function buildStandingsRulesQueryOptions(teamId: string) {
  return {
    queryKey: standingsQueryKeys.rules(teamId),
    queryFn: () => listStandingsRules(teamId),
    enabled: teamId !== '',
  };
}

/** Query options for one achievements workspace page. */
export function buildAchievementsQueryOptions(
  teamId: string,
  filters: AchievementsFilters,
  offset: number,
) {
  return {
    queryKey: standingsQueryKeys.achievements(
      teamId,
      filters.status ?? STANDINGS_FILTER_ALL,
      filters.category ?? STANDINGS_FILTER_ALL,
      offset,
    ),
    queryFn: () => listAchievements(teamId, filters, offset),
    enabled: teamId !== '',
  };
}

/** Query options for one trophy-cabinet page. */
export function buildTeamHistoryQueryOptions(
  teamId: string,
  filters: TeamHistoryFilters,
  offset: number,
) {
  return {
    queryKey: standingsQueryKeys.history(teamId, filters.category ?? STANDINGS_FILTER_ALL, offset),
    queryFn: () => getTeamHistory(teamId, filters, offset),
    enabled: teamId !== '',
  };
}
