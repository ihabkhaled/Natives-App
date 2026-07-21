import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  currentSeasonPath,
  myTeamsPath,
  roleMatrixPath,
  seasonPath,
  seasonTransitionPath,
  seasonsPath,
  teamPath,
  teamTransitionPath,
  teamsPath,
} from '../constants/teams-api.constants';
import { TEAMS_LIMITS } from '../constants/teams.constants';
import {
  roleMatrixResponseSchema,
  seasonListResponseSchema,
  seasonResponseSchema,
  teamListResponseSchema,
  teamResponseSchema,
} from '../schemas/teams.schema';
import type {
  CreateSeasonInput,
  CreateTeamInput,
  UpdateSeasonInput,
  UpdateTeamInput,
} from '../types/teams.types';

type TeamListDto = SchemaOutput<typeof teamListResponseSchema>;
type TeamDto = SchemaOutput<typeof teamResponseSchema>;
type SeasonListDto = SchemaOutput<typeof seasonListResponseSchema>;
type SeasonDto = SchemaOutput<typeof seasonResponseSchema>;
type RoleMatrixDto = SchemaOutput<typeof roleMatrixResponseSchema>;

/** Optional team fields are omitted rather than sent as null: the backend
 *  applies its own schema defaults (locale `en`, timezone `Africa/Cairo`) and a
 *  null would overwrite them with nothing. */
function buildTeamBody(input: CreateTeamInput | UpdateTeamInput): Record<string, unknown> {
  return {
    name: input.name,
    ...(input.timezone === null ? {} : { timezone: input.timezone }),
    ...(input.locale === null ? {} : { locale: input.locale }),
    ...(input.primaryColor === null ? {} : { primaryColor: input.primaryColor }),
  };
}

/** One bounded page of teams the caller is allowed to see. */
export function requestTeams(): Promise<TeamListDto> {
  return getAppHttpClient().get(teamsPath(), teamListResponseSchema, {
    params: { limit: TEAMS_LIMITS.teamsPageSize, offset: 0 },
  });
}

export function requestCreateTeam(input: CreateTeamInput): Promise<TeamDto> {
  return getAppHttpClient().post(
    teamsPath(),
    { slug: input.slug, ...buildTeamBody(input) },
    teamResponseSchema,
  );
}

export function requestUpdateTeam(teamId: string, input: UpdateTeamInput): Promise<TeamDto> {
  return getAppHttpClient().patch(
    teamPath(teamId),
    { ...buildTeamBody(input), expectedVersion: input.expectedVersion },
    teamResponseSchema,
  );
}

/**
 * Run one team lifecycle transition. The body carries the optimistic-concurrency
 * token so a stale view cannot move a team someone else already moved.
 */
export function requestTeamTransition(
  teamId: string,
  transition: string,
  expectedVersion: number,
): Promise<TeamDto> {
  return getAppHttpClient().post(
    teamTransitionPath(teamId, transition),
    { expectedVersion },
    teamResponseSchema,
  );
}

/** The caller's own teams: the team-scoped read every member may perform. */
export function requestMyTeams(): Promise<TeamListDto> {
  return getAppHttpClient().get(myTeamsPath(), teamListResponseSchema, {
    params: { limit: TEAMS_LIMITS.teamsPageSize, offset: 0 },
  });
}

export function requestSeasons(teamId: string): Promise<SeasonListDto> {
  return getAppHttpClient().get(seasonsPath(teamId), seasonListResponseSchema, {
    params: { limit: TEAMS_LIMITS.seasonsPageSize, offset: 0 },
  });
}

export function requestCreateSeason(teamId: string, input: CreateSeasonInput): Promise<SeasonDto> {
  return getAppHttpClient().post(
    seasonsPath(teamId),
    {
      slug: input.slug,
      name: input.name,
      startsOn: input.startsOn,
      endsOn: input.endsOn,
      status: input.status,
    },
    seasonResponseSchema,
  );
}

export function requestUpdateSeason(
  teamId: string,
  seasonId: string,
  input: UpdateSeasonInput,
): Promise<SeasonDto> {
  return getAppHttpClient().patch(
    seasonPath(teamId, seasonId),
    {
      slug: input.slug,
      name: input.name,
      startsOn: input.startsOn,
      endsOn: input.endsOn,
      status: input.status,
      expectedVersion: input.expectedVersion,
    },
    seasonResponseSchema,
  );
}

/** Run one season lifecycle transition (activate / close / archive). */
export function requestSeasonTransition(
  teamId: string,
  seasonId: string,
  transition: string,
  expectedVersion: number,
): Promise<SeasonDto> {
  return getAppHttpClient().post(
    seasonTransitionPath(teamId, seasonId, transition),
    { expectedVersion },
    seasonResponseSchema,
  );
}

/** The season covering today. A 404 means there is none — never a guess. */
export function requestCurrentSeason(teamId: string): Promise<SeasonDto> {
  return getAppHttpClient().get(currentSeasonPath(teamId), seasonResponseSchema);
}

/** The seeded role x permission matrix, unscoped: the catalog is global. */
export function requestRoleMatrix(teamId: string): Promise<RoleMatrixDto> {
  return getAppHttpClient().get(roleMatrixPath(), roleMatrixResponseSchema, {
    ...(teamId === '' ? {} : { params: { teamId } }),
  });
}
