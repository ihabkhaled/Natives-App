import { http, HttpResponse } from 'msw';

import { PERMISSIONS } from '@/shared/security';

import { apiUrl, failRequest, pathParam, readJsonBody, readPaging } from './mock-request.helper';
import { has, queryValue } from './persona-permissions.helper';
import {
  applyMockRsvpOverride,
  readMockRsvpHistory,
  readMockRsvpParticipants,
  readMockRsvpSummary,
} from './practice-rsvp-detail.fixture';

const BASE = '/teams/:teamId/practice-sessions/:sessionId/rsvps';

/**
 * NestJS-shaped RSVP-detail handlers.
 *
 * Every route is `practice.manage`. Who is coming — and changing that on
 * somebody's behalf — is a coach's action, so a member holding only
 * `practice.read` gets a 403 here even though they may read the same
 * session's agenda. `/rsvps/summary` is registered before the
 * `/rsvps/:membershipId` routes so the literal segment wins the match.
 */
export const practiceRsvpDetailHandlers = [
  http.get(apiUrl(BASE), ({ request }) => {
    if (!has(request, PERMISSIONS.practicesManage)) {
      return failRequest(403, 'FORBIDDEN', BASE);
    }
    const { limit, offset } = readPaging(request);
    const status = queryValue(request, 'status');
    return HttpResponse.json(readMockRsvpParticipants(limit, offset, status));
  }),
  http.get(apiUrl(`${BASE}/summary`), ({ request, params }) => {
    if (!has(request, PERMISSIONS.practicesManage)) {
      return failRequest(403, 'FORBIDDEN', `${BASE}/summary`);
    }
    return HttpResponse.json(readMockRsvpSummary(pathParam(params, 'sessionId')));
  }),
  http.put(apiUrl(`${BASE}/:membershipId`), async ({ request, params }) => {
    if (!has(request, PERMISSIONS.practicesManage)) {
      return failRequest(403, 'FORBIDDEN', `${BASE}/:membershipId`);
    }
    const body = await readJsonBody<Record<string, unknown>>(request);
    const result = applyMockRsvpOverride(
      pathParam(params, 'sessionId'),
      pathParam(params, 'membershipId'),
      body,
    );
    if (result === null) {
      return failRequest(404, 'NOT_FOUND', `${BASE}/:membershipId`);
    }
    return HttpResponse.json(result);
  }),
  http.get(apiUrl(`${BASE}/:membershipId/history`), ({ request, params }) => {
    if (!has(request, PERMISSIONS.practicesManage)) {
      return failRequest(403, 'FORBIDDEN', `${BASE}/:membershipId/history`);
    }
    return HttpResponse.json(readMockRsvpHistory(pathParam(params, 'membershipId')));
  }),
];
