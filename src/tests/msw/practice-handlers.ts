import { http, HttpResponse } from 'msw';

import type { SetRsvpRequestContract } from '@/packages/api-contract';

import { apiUrl, isAuthorized } from './mock-request.helper';
import { nestErrorResponse } from './nest-error.helper';
import {
  applyRsvp,
  buildPracticeListResponse,
  findPracticeRsvp,
  findPracticeSession,
  type PracticeListQuery,
  type RsvpApplyResult,
} from './practice.fixture';

const DEFAULT_LIMIT = 20;

function unauthorized(path: string): Response {
  return nestErrorResponse({
    statusCode: 401,
    code: 'UNAUTHORIZED',
    message: 'Missing or invalid access token',
    path: `/api/v1${path}`,
  });
}

function parseNumber(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseListQuery(request: Request): PracticeListQuery {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  return {
    from: url.searchParams.get('from'),
    to: url.searchParams.get('to'),
    sessionType: url.searchParams.get('sessionType'),
    status:
      status === 'draft' ||
      status === 'published' ||
      status === 'rescheduled' ||
      status === 'cancelled' ||
      status === 'completed' ||
      status === 'archived'
        ? status
        : null,
    limit: parseNumber(url.searchParams.get('limit'), DEFAULT_LIMIT),
    offset: parseNumber(url.searchParams.get('offset'), 0),
  };
}

function practicePath(teamId: string, suffix: string): string {
  return `/teams/${teamId}/practice-sessions${suffix}`;
}

function notFound(path: string): Response {
  return nestErrorResponse({
    statusCode: 404,
    code: 'NOT_FOUND',
    message: 'No such session',
    path: `/api/v1${path}`,
  });
}

function rsvpErrorResponse(result: RsvpApplyResult, path: string): Response {
  if (result.kind === 'not-found') {
    return notFound(path);
  }
  if (result.kind === 'conflict') {
    return nestErrorResponse({
      statusCode: 409,
      code: 'RSVP_VERSION_CONFLICT',
      message: 'RSVP was changed elsewhere',
      path: `/api/v1${path}`,
    });
  }
  return nestErrorResponse({
    statusCode: 422,
    code: 'RSVP_DEADLINE_PASSED',
    message: 'The RSVP deadline has passed',
    path: `/api/v1${path}`,
  });
}

/** Canonical team-scoped practice calendar, detail, and self-RSVP handlers. */
export const practiceHandlers = [
  http.get(apiUrl('/teams/:teamId/practice-sessions'), ({ request, params }) => {
    const path = practicePath(String(params['teamId']), '');
    if (!isAuthorized(request)) {
      return unauthorized(path);
    }
    return HttpResponse.json(
      buildPracticeListResponse(String(params['teamId']), parseListQuery(request)),
    );
  }),
  http.get(apiUrl('/teams/:teamId/practice-sessions/:sessionId'), ({ request, params }) => {
    const path = practicePath(String(params['teamId']), `/${String(params['sessionId'])}`);
    if (!isAuthorized(request)) {
      return unauthorized(path);
    }
    const session = findPracticeSession(String(params['teamId']), String(params['sessionId']));
    return session === undefined ? notFound(path) : HttpResponse.json(session);
  }),
  http.get(apiUrl('/teams/:teamId/practice-sessions/:sessionId/rsvp'), ({ request, params }) => {
    const path = practicePath(String(params['teamId']), `/${String(params['sessionId'])}/rsvp`);
    if (!isAuthorized(request)) {
      return unauthorized(path);
    }
    const rsvp = findPracticeRsvp(String(params['teamId']), String(params['sessionId']));
    return rsvp === undefined ? notFound(path) : HttpResponse.json(rsvp);
  }),
  http.put(
    apiUrl('/teams/:teamId/practice-sessions/:sessionId/rsvp'),
    async ({ request, params }) => {
      const path = practicePath(String(params['teamId']), `/${String(params['sessionId'])}/rsvp`);
      if (!isAuthorized(request)) {
        return unauthorized(path);
      }
      const body = (await request.json().catch(() => ({}))) as SetRsvpRequestContract;
      const result = applyRsvp(String(params['teamId']), String(params['sessionId']), body);
      return result.kind === 'ok'
        ? HttpResponse.json(result.rsvp)
        : rsvpErrorResponse(result, path);
    },
  ),
];
