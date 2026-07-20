import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  competitionFixturesPath,
  competitionPath,
  competitionStructurePath,
  competitionsPath,
  opponentsPath,
} from '../constants/competitions-api.constants';
import { PAGE_PARAMS } from '../constants/competitions.constants';
import {
  competitionListResponseSchema,
  competitionResponseSchema,
  competitionStructureResponseSchema,
  fixtureListResponseSchema,
  opponentListResponseSchema,
} from '../schemas/competition.schema';

type CompetitionListDto = SchemaOutput<typeof competitionListResponseSchema>;
type CompetitionDto = SchemaOutput<typeof competitionResponseSchema>;
type StructureDto = SchemaOutput<typeof competitionStructureResponseSchema>;
type FixtureListDto = SchemaOutput<typeof fixtureListResponseSchema>;
type OpponentListDto = SchemaOutput<typeof opponentListResponseSchema>;

/** One bounded page of the team's competitions. */
export function requestCompetitions(teamId: string): Promise<CompetitionListDto> {
  return getAppHttpClient().get(competitionsPath(teamId), competitionListResponseSchema, {
    params: PAGE_PARAMS,
  });
}

export function requestCompetition(teamId: string, competitionId: string): Promise<CompetitionDto> {
  return getAppHttpClient().get(competitionPath(teamId, competitionId), competitionResponseSchema);
}

export function requestCompetitionStructure(
  teamId: string,
  competitionId: string,
): Promise<StructureDto> {
  return getAppHttpClient().get(
    competitionStructurePath(teamId, competitionId),
    competitionStructureResponseSchema,
  );
}

export function requestCompetitionFixtures(
  teamId: string,
  competitionId: string,
): Promise<FixtureListDto> {
  return getAppHttpClient().get(
    competitionFixturesPath(teamId, competitionId),
    fixtureListResponseSchema,
    { params: PAGE_PARAMS },
  );
}

/** The opponent directory; contact fields are dropped by the schema. */
export function requestOpponents(teamId: string): Promise<OpponentListDto> {
  return getAppHttpClient().get(opponentsPath(teamId), opponentListResponseSchema, {
    params: PAGE_PARAMS,
  });
}
