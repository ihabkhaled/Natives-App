import { http, HttpResponse } from 'msw';

import { apiUrl, isAuthorized } from './mock-request.helper';
import { nestErrorResponse } from './nest-error.helper';
import {
  applyRsvp,
  buildPracticeListResponse,
  buildUpcomingResponse,
  findPracticeDetail,
  type PracticeListQuery,
  type RsvpApplyResult,
  type RsvpSubmissionBody,
} from './practice.fixture';

const DEFAULT_PAGE_SIZE = 20;

function unauthorized(path: string): Response {
  return nestErrorResponse({
    statusCode: 401,
    code: 'UNAUTHORIZED',
    message: 'Missing or invalid access token',
    path: `/api/v1${path}`,
  });
}

function parseListQuery(request: Request): PracticeListQuery {
  const url = new URL(request.url);
  const rawPageSize = Number.parseInt(url.searchParams.get('pageSize') ?? '', 10);
  return {
    scope: url.searchParams.get('scope') ?? 'upcoming',
    type: url.searchParams.get('type'),
    rsvp: url.searchParams.get('rsvp'),
    pageSize: Number.isNaN(rawPageSize) ? DEFAULT_PAGE_SIZE : rawPageSize,
  };
}

function rsvpErrorResponse(result: RsvpApplyResult, sessionId: string): Response {
  const path = `/api/v1/practices/sessions/${sessionId}/rsvp`;
  if (result.kind === 'not-found') {
    return nestErrorResponse({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'No such session',
      path,
    });
  }
  if (result.kind === 'conflict') {
    return nestErrorResponse({
      statusCode: 409,
      code: 'RSVP_VERSION_CONFLICT',
      message: 'RSVP was changed elsewhere',
      path,
    });
  }
  return nestErrorResponse({
    statusCode: 422,
    code: 'RSVP_DEADLINE_PASSED',
    message: 'The RSVP deadline has passed',
    path,
  });
}

/** NestJS-shaped practice calendar, detail, and RSVP handlers. */
export const practiceHandlers = [
  http.get(apiUrl('/practices/sessions/upcoming'), ({ request }) => {
    if (!isAuthorized(request)) {
      return unauthorized('/practices/sessions/upcoming');
    }
    return HttpResponse.json(buildUpcomingResponse());
  }),
  http.get(apiUrl('/practices/sessions/:sessionId'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return unauthorized('/practices/sessions/:sessionId');
    }
    const detail = findPracticeDetail(String(params['sessionId']));
    if (detail === undefined) {
      return nestErrorResponse({
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'No such session',
        path: `/api/v1/practices/sessions/${String(params['sessionId'])}`,
      });
    }
    return HttpResponse.json(detail);
  }),
  http.get(apiUrl('/practices/sessions'), ({ request }) => {
    if (!isAuthorized(request)) {
      return unauthorized('/practices/sessions');
    }
    return HttpResponse.json(buildPracticeListResponse(parseListQuery(request)));
  }),
  http.put(apiUrl('/practices/sessions/:sessionId/rsvp'), async ({ request, params }) => {
    if (!isAuthorized(request)) {
      return unauthorized('/practices/sessions/:sessionId/rsvp');
    }
    const sessionId = String(params['sessionId']);
    const body = (await request.json().catch(() => ({}))) as RsvpSubmissionBody;
    const result = applyRsvp(sessionId, body);
    if (result.kind === 'ok') {
      return HttpResponse.json(result.detail);
    }
    return rsvpErrorResponse(result, sessionId);
  }),
];
