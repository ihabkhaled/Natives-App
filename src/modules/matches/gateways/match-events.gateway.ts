import { getAppHttpClient } from '@/packages/http';
import type { SchemaOutput } from '@/packages/schema';

import { matchEventsPath, SCOREKEEPER_PATH_BY_KIND } from '../constants/matches-api.constants';
import { MATCH_EVENT_PAGE_PARAMS } from '../constants/matches.constants';
import {
  matchEventListResponseSchema,
  matchOperationResponseSchema,
} from '../schemas/match.schema';
import { buildScorekeeperRequestBody } from '../helpers/scorekeeper-payload.helper';
import type { ScorekeeperQueuedOperation } from '../types/matches.types';

type EventListDto = SchemaOutput<typeof matchEventListResponseSchema>;
type OperationDto = SchemaOutput<typeof matchOperationResponseSchema>;

/** The append-only stream, bounded and ordered by the server. */
export function requestMatchEvents(teamId: string, matchId: string): Promise<EventListDto> {
  return getAppHttpClient().get(matchEventsPath(teamId, matchId), matchEventListResponseSchema, {
    params: MATCH_EVENT_PAGE_PARAMS,
  });
}

/**
 * Submit one queued scorekeeper command.
 *
 * The operation id and the base stream version travel with the body exactly as
 * they were captured on the field, so a retry of the same operation is a replay
 * for the server (one score change, not two) and a stale queue is rejected
 * instead of being applied out of order.
 */
export function requestScorekeeperOperation(
  operation: ScorekeeperQueuedOperation,
): Promise<OperationDto> {
  const path = SCOREKEEPER_PATH_BY_KIND[operation.kind](operation.teamId, operation.matchId);
  return getAppHttpClient().post(
    path,
    buildScorekeeperRequestBody(operation),
    matchOperationResponseSchema,
  );
}
