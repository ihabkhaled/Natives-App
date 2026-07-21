import type { Season, Team } from '@/modules/teams';

/** One active team, in the app's own shape. */
export function buildTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: 'team-1',
    slug: 'un',
    name: 'Ultimate Natives',
    locale: 'en',
    timezone: 'Africa/Cairo',
    primaryColor: '#000000',
    status: 'active',
    updatedAtIso: '2026-01-01T00:00:00.000Z',
    version: 4,
    ...overrides,
  };
}

/** One draft season, in the app's own shape. */
export function buildSeason(overrides: Partial<Season> = {}): Season {
  return {
    id: 'season-1',
    teamId: 'team-1',
    slug: '2026',
    name: 'Season 2026',
    startsOn: '2026-01-01',
    endsOn: '2026-12-31',
    status: 'draft',
    version: 1,
    ...overrides,
  };
}

/**
 * The teams context every team/season/matrix screen reads. Defaults to a TEAM
 * administrator: the persona that holds the team-scoped grants and none of the
 * platform ones, which is the distinction these screens exist to respect.
 */
export function buildTeamsContext(overrides: Record<string, unknown> = {}) {
  return {
    teamId: 'team-1',
    isOffline: false,
    isLoading: false,
    canReadTeams: true,
    canBrowseAllTeams: false,
    canCreateTeams: false,
    canManageTeams: true,
    canManageSeasons: true,
    canReadRoleMatrix: true,
    ...overrides,
  };
}
