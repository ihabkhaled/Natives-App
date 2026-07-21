import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import {
  matchFinalizationPath,
  matchRulesetsPath,
  matchScoreboardPath,
  matchTransitionPath,
  matchesPath,
} from '../constants/matches-api.constants';
import { MATCH_PAGE_PARAMS } from '../constants/matches.constants';
import {
  matchListResponseSchema,
  matchResponseSchema,
  matchRulesetListResponseSchema,
  matchScoreboardResponseSchema,
} from '../schemas/match.schema';
import type { FinalizeMatchCommand, MatchTransitionCommand } from '../types/matches.types';

type MatchListDto = SchemaOutput<typeof matchListResponseSchema>;
type MatchDto = SchemaOutput<typeof matchResponseSchema>;
type ScoreboardDto = SchemaOutput<typeof matchScoreboardResponseSchema>;
type RulesetListDto = SchemaOutput<typeof matchRulesetListResponseSchema>;

/** One bounded, deterministically ordered page of the team's matches. */
export function requestMatches(teamId: string): Promise<MatchListDto> {
  return getAppHttpClient().get(matchesPath(teamId), matchListResponseSchema, {
    params: MATCH_PAGE_PARAMS,
  });
}

/** The server's projection of the live score, caps, and timeout allowance. */
export function requestMatchScoreboard(teamId: string, matchId: string): Promise<ScoreboardDto> {
  return getAppHttpClient().get(
    matchScoreboardPath(teamId, matchId),
    matchScoreboardResponseSchema,
  );
}

export function requestMatchRulesets(teamId: string): Promise<RulesetListDto> {
  return getAppHttpClient().get(matchRulesetsPath(teamId), matchRulesetListResponseSchema, {
    params: MATCH_PAGE_PARAMS,
  });
}

/** State-machine transition guarded by the record version the client last saw. */
export function requestMatchTransition(
  teamId: string,
  matchId: string,
  command: MatchTransitionCommand,
): Promise<MatchDto> {
  return getAppHttpClient().post(
    matchTransitionPath(teamId, matchId),
    { transition: command.transition, expectedRecordVersion: command.expectedRecordVersion },
    matchResponseSchema,
  );
}

/** Publishing the final score; the backend enforces immutability afterwards. */
export function requestMatchFinalization(
  teamId: string,
  matchId: string,
  command: FinalizeMatchCommand,
): Promise<MatchDto> {
  return getAppHttpClient().post(
    matchFinalizationPath(teamId, matchId),
    { expectedRecordVersion: command.expectedRecordVersion },
    matchResponseSchema,
  );
}
