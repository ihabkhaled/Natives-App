import { http, HttpResponse } from 'msw';

import { apiUrl, failRequest, isAuthorized, pathParam, readJsonBody } from './mock-request.helper';
import {
  removeRosterEntryRecord,
  rosterEntriesResponse,
  rosterResponse,
  rosterSnapshotsResponse,
  rosterValidationResponse,
  rostersResponse,
  transitionRosterRecord,
} from './rosters.fixture';

interface VersionBody {
  readonly expectedRecordVersion?: number;
}

interface TransitionBody extends VersionBody {
  readonly transition?: 'publish' | 'archive';
}

function rosterUrl(suffix: string): string {
  return apiUrl(`/teams/:teamId/rosters${suffix}`);
}

const readHandlers = [
  http.get(rosterUrl(''), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(rostersResponse())
      : failRequest(401, 'UNAUTHORIZED', '/rosters'),
  ),
  http.get(rosterUrl('/:rosterId'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/rosters');
    }
    const record = rosterResponse(pathParam(params, 'rosterId'));
    return record === null ? failRequest(404, 'NOT_FOUND', '/rosters') : HttpResponse.json(record);
  }),
  http.get(rosterUrl('/:rosterId/entries'), ({ request, params }) =>
    isAuthorized(request)
      ? HttpResponse.json(rosterEntriesResponse(pathParam(params, 'rosterId')))
      : failRequest(401, 'UNAUTHORIZED', '/rosters'),
  ),
  http.get(rosterUrl('/:rosterId/validation'), ({ request, params }) =>
    isAuthorized(request)
      ? HttpResponse.json(rosterValidationResponse(pathParam(params, 'rosterId')))
      : failRequest(401, 'UNAUTHORIZED', '/rosters'),
  ),
  http.get(rosterUrl('/:rosterId/snapshots'), ({ request, params }) =>
    isAuthorized(request)
      ? HttpResponse.json(rosterSnapshotsResponse(pathParam(params, 'rosterId')))
      : failRequest(401, 'UNAUTHORIZED', '/rosters'),
  ),
];

const writeHandlers = [
  http.post(rosterUrl('/:rosterId/entries/:membershipId/removal'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/rosters');
    }
    const record = removeRosterEntryRecord(
      pathParam(params, 'rosterId'),
      pathParam(params, 'membershipId'),
    );
    return record === null ? failRequest(404, 'NOT_FOUND', '/rosters') : HttpResponse.json(record);
  }),
  http.post(rosterUrl('/:rosterId/lock'), async ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/rosters');
    }
    const body = await readJsonBody<VersionBody>(request);
    const result = transitionRosterRecord(
      pathParam(params, 'rosterId'),
      'lock',
      body.expectedRecordVersion ?? 0,
    );
    if (result === 'not-found') {
      return failRequest(404, 'NOT_FOUND', '/rosters');
    }
    return result === 'conflict'
      ? failRequest(409, 'VERSION_CONFLICT', '/rosters')
      : HttpResponse.json(result);
  }),
  http.post(rosterUrl('/:rosterId/transition'), async ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/rosters');
    }
    const body = await readJsonBody<TransitionBody>(request);
    if (body.transition === undefined) {
      return failRequest(400, 'VALIDATION_ERROR', '/rosters');
    }
    const result = transitionRosterRecord(
      pathParam(params, 'rosterId'),
      body.transition,
      body.expectedRecordVersion ?? 0,
    );
    if (result === 'not-found') {
      return failRequest(404, 'NOT_FOUND', '/rosters');
    }
    return result === 'conflict'
      ? failRequest(409, 'VERSION_CONFLICT', '/rosters')
      : HttpResponse.json(result);
  }),
];

/** NestJS-shaped roster handlers; the same Zod schemas parse both modes. */
export const rostersHandlers = [...readHandlers, ...writeHandlers];
