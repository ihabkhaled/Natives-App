import { http, HttpResponse } from 'msw';

import { applyScorekeeperCommand } from './match-operations.fixture';
import type { OperationResult, ScorekeeperCommandBody } from './match-operations.fixture';
import { matchStatisticsResponse } from './match-statistics.fixture';
import {
  eventsResponse,
  matchRecord,
  matchesResponse,
  rulesetsResponse,
  scoreboardResponse,
} from './matches.fixture';
import { apiUrl, failRequest, isAuthorized, pathParam, readJsonBody } from './mock-request.helper';

const RESOURCE = '/matches';

function matchUrl(suffix: string): string {
  return apiUrl(`/teams/:teamId/matches${suffix}`);
}

function operationResponse(result: OperationResult): Response {
  if (result.kind === 'not-found') {
    return failRequest(404, 'NOT_FOUND', RESOURCE);
  }
  if (result.kind === 'invalid') {
    return failRequest(400, 'VALIDATION_ERROR', RESOURCE);
  }
  // Same operation id with a different payload, or a stale expected stream
  // version. The server never merges; the client must surface it.
  if (result.kind === 'conflict') {
    return failRequest(409, 'OPERATION_CONFLICT', RESOURCE);
  }
  return HttpResponse.json(result.body, { status: 201 });
}

const readHandlers = [
  http.get(matchUrl(''), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(matchesResponse())
      : failRequest(401, 'UNAUTHORIZED', RESOURCE),
  ),
  http.get(apiUrl('/teams/:teamId/match-rulesets'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(rulesetsResponse())
      : failRequest(401, 'UNAUTHORIZED', RESOURCE),
  ),
  http.get(matchUrl('/:matchId'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', RESOURCE);
    }
    const record = matchRecord(pathParam(params, 'matchId'));
    return record === null
      ? failRequest(404, 'NOT_FOUND', RESOURCE)
      : HttpResponse.json(record.match);
  }),
  http.get(matchUrl('/:matchId/scoreboard'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', RESOURCE);
    }
    const board = scoreboardResponse(pathParam(params, 'matchId'));
    return board === null ? failRequest(404, 'NOT_FOUND', RESOURCE) : HttpResponse.json(board);
  }),
  http.get(matchUrl('/:matchId/events'), ({ request, params }) =>
    isAuthorized(request)
      ? HttpResponse.json(eventsResponse(pathParam(params, 'matchId')))
      : failRequest(401, 'UNAUTHORIZED', RESOURCE),
  ),
  http.get(matchUrl('/:matchId/statistics'), ({ request, params }) =>
    isAuthorized(request)
      ? HttpResponse.json(matchStatisticsResponse(pathParam(params, 'matchId')))
      : failRequest(401, 'UNAUTHORIZED', RESOURCE),
  ),
];

function commandHandler(suffix: string, kind: 'point' | 'timeout' | 'void') {
  return http.post(matchUrl(`/:matchId/events/${suffix}`), async ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', RESOURCE);
    }
    const body = await readJsonBody<ScorekeeperCommandBody>(request);
    return operationResponse(applyScorekeeperCommand(pathParam(params, 'matchId'), kind, body));
  });
}

interface VersionedBody {
  readonly expectedRecordVersion?: number;
  readonly transition?: string;
}

function versionedResponse(matchId: string, body: VersionedBody, nextStatus: string): Response {
  const record = matchRecord(matchId);
  if (record === null) {
    return failRequest(404, 'NOT_FOUND', RESOURCE);
  }
  if (body.expectedRecordVersion !== record.match.recordVersion) {
    return failRequest(409, 'VERSION_CONFLICT', RESOURCE);
  }
  record.match = {
    ...record.match,
    status: nextStatus as typeof record.match.status,
    recordVersion: record.match.recordVersion + 1,
  };
  return HttpResponse.json(record.match);
}

const TRANSITION_TO_STATUS: Record<string, string> = {
  ready: 'ready',
  start: 'live',
  pause: 'paused',
  resume: 'live',
  halftime: 'halftime',
  complete: 'completed',
};

const writeHandlers = [
  commandHandler('point', 'point'),
  commandHandler('timeout', 'timeout'),
  commandHandler('void', 'void'),
  http.post(matchUrl('/:matchId/transition'), async ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', RESOURCE);
    }
    const body = await readJsonBody<VersionedBody>(request);
    const next = TRANSITION_TO_STATUS[body.transition ?? ''];
    return next === undefined
      ? failRequest(400, 'VALIDATION_ERROR', RESOURCE)
      : versionedResponse(pathParam(params, 'matchId'), body, next);
  }),
  http.post(matchUrl('/:matchId/finalization'), async ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', RESOURCE);
    }
    const body = await readJsonBody<VersionedBody>(request);
    return versionedResponse(pathParam(params, 'matchId'), body, 'finalized');
  }),
];

/** NestJS-shaped match handlers; the same Zod schemas parse both modes. */
export const matchesHandlers = [...readHandlers, ...writeHandlers];
