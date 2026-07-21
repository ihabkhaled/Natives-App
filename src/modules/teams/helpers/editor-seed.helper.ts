import { SEASON_STATUS, type SeasonStatus } from '../constants/teams.constants';
import type { Season, Team } from '../types/teams.types';

/** The team editor's field values, all strings so a half-typed value stays honest. */
export interface TeamFormValues {
  readonly slug: string;
  readonly name: string;
  readonly timezone: string;
  readonly locale: string;
  readonly color: string;
}

/** Seed the team editor from the team being edited, or blank for a new one. */
export function toTeamFormValues(team: Team | null): TeamFormValues {
  if (team === null) {
    return { slug: '', name: '', timezone: '', locale: '', color: '' };
  }
  return {
    slug: team.slug,
    name: team.name,
    timezone: team.timezone,
    locale: team.locale,
    color: team.primaryColor ?? '',
  };
}

export interface SeasonFormValues {
  readonly slug: string;
  readonly name: string;
  readonly startsOn: string;
  readonly endsOn: string;
  readonly status: SeasonStatus;
}

/**
 * Seed the season editor. A new season starts as a draft: it should not become
 * visible to players the moment it is saved.
 */
export function toSeasonFormValues(season: Season | null): SeasonFormValues {
  if (season === null) {
    return { slug: '', name: '', startsOn: '', endsOn: '', status: SEASON_STATUS.draft };
  }
  return {
    slug: season.slug,
    name: season.name,
    startsOn: season.startsOn,
    endsOn: season.endsOn,
    status: season.status,
  };
}
