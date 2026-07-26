import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  standingsManualPath,
  standingsPath,
  standingsRecomputePath,
  standingsRulesPath,
} from '../constants/standings-api.constants';
import { STANDINGS_LIMITS } from '../constants/standings.constants';
import {
  listStandingsResponseSchema,
  listStandingsRulesResponseSchema,
  standingResponseSchema,
  standingsRecomputeReportSchema,
  standingsRuleResponseSchema,
} from '../schemas/standings.schema';
import type {
  CreateStandingsRuleCommand,
  RecomputeStandingsCommand,
  RecordManualStandingCommand,
  StandingsFilters,
} from '../types/standings.types';

type StandingsListDto = SchemaOutput<typeof listStandingsResponseSchema>;
type StandingDto = SchemaOutput<typeof standingResponseSchema>;
type RecomputeReportDto = SchemaOutput<typeof standingsRecomputeReportSchema>;
type RulesListDto = SchemaOutput<typeof listStandingsRulesResponseSchema>;
type RuleDto = SchemaOutput<typeof standingsRuleResponseSchema>;

/** One bounded, server-sorted standings page for the chosen facets. */
export function requestStandings(
  teamId: string,
  filters: StandingsFilters,
): Promise<StandingsListDto> {
  return getAppHttpClient().get(standingsPath(teamId), listStandingsResponseSchema, {
    params: {
      competitionId: filters.competitionId,
      limit: STANDINGS_LIMITS.standingsPageSize,
      offset: 0,
      ...(filters.source === null ? {} : { source: filters.source }),
    },
  });
}

/** Derive the table from finalized matches under a named rule family. */
export function requestRecomputeStandings(
  teamId: string,
  command: RecomputeStandingsCommand,
): Promise<RecomputeReportDto> {
  return getAppHttpClient().post(
    standingsRecomputePath(teamId),
    command,
    standingsRecomputeReportSchema,
  );
}

/** Record an external row; the reconciliation note is mandatory provenance. */
export function requestRecordManualStanding(
  teamId: string,
  command: RecordManualStandingCommand,
): Promise<StandingDto> {
  return getAppHttpClient().post(standingsManualPath(teamId), command, standingResponseSchema);
}

/** Every published rule version, newest first within a family. */
export function requestStandingsRules(teamId: string): Promise<RulesListDto> {
  return getAppHttpClient().get(standingsRulesPath(teamId), listStandingsRulesResponseSchema, {
    params: { limit: STANDINGS_LIMITS.rulesPageSize, offset: 0 },
  });
}

/** Publish version N+1 of a rule family; versions are never edited. */
export function requestCreateStandingsRule(
  teamId: string,
  command: CreateStandingsRuleCommand,
): Promise<RuleDto> {
  return getAppHttpClient().post(standingsRulesPath(teamId), command, standingsRuleResponseSchema);
}
