import { http, HttpResponse } from 'msw';

import { PERMISSIONS } from '@/shared/security';

import { apiUrl, failRequest, isAuthorized, pathParam, readJsonBody } from './mock-request.helper';
import { permissionsForRequest } from './persona-permissions.helper';
import {
  checkInCandidateRecord,
  convertCandidateRecord,
  decideCandidateRecord,
  registerCandidateRecord,
  saveEvaluationRecord,
  tryoutCandidateResponse,
  tryoutCandidatesResponse,
  tryoutEventResponse,
  tryoutEventsResponse,
} from './tryouts.fixture';

interface RegisterBody {
  readonly tryoutId?: string;
  readonly email?: string;
  readonly consentGiven?: boolean;
}

interface EvaluationBody {
  readonly scores?: { criterion: string; score: number | null }[];
  readonly note?: string | null;
}

interface DecisionBody {
  readonly outcome?: 'accept' | 'waitlist' | 'decline';
  readonly reason?: string;
}

function teamUrl(suffix: string): string {
  return apiUrl(`/teams/:teamId/tryouts${suffix}`);
}

/** The public surfaces a candidate reaches without any session at all. */
const publicHandlers = [
  http.get(apiUrl('/public/tryout-events'), () => HttpResponse.json(tryoutEventsResponse())),
  http.post(apiUrl('/public/tryout-registrations'), async ({ request }) => {
    const body = await readJsonBody<RegisterBody>(request);
    if (body.tryoutId === undefined || body.email === undefined) {
      return failRequest(400, 'VALIDATION_ERROR', '/public/tryout-registrations');
    }
    const result = registerCandidateRecord(body.tryoutId, body.email, body.consentGiven === true);
    return result === 'consent-required'
      ? failRequest(400, 'VALIDATION_ERROR', '/public/tryout-registrations')
      : HttpResponse.json(result, { status: 201 });
  }),
];

const eventHandlers = [
  http.get(teamUrl(''), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(tryoutEventsResponse())
      : failRequest(401, 'UNAUTHORIZED', '/tryouts'),
  ),
  http.get(teamUrl('/:tryoutId'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/tryouts');
    }
    const record = tryoutEventResponse(pathParam(params, 'tryoutId'));
    return record === null ? failRequest(404, 'NOT_FOUND', '/tryouts') : HttpResponse.json(record);
  }),
  http.get(teamUrl('/:tryoutId/candidates'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(tryoutCandidatesResponse())
      : failRequest(401, 'UNAUTHORIZED', '/tryouts'),
  ),
  /**
   * The server, not the client, decides which restricted blocks travel: a
   * caller without the grant receives `contacts: null` / `readiness: null`.
   */
  http.get(teamUrl('/:tryoutId/candidates/:candidateId'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/tryouts');
    }
    const granted = permissionsForRequest(request);
    const record = tryoutCandidateResponse(pathParam(params, 'candidateId'), {
      contacts: granted.includes(PERMISSIONS.tryoutContactsRead),
      readiness: granted.includes(PERMISSIONS.tryoutReadinessRead),
    });
    return record === null ? failRequest(404, 'NOT_FOUND', '/tryouts') : HttpResponse.json(record);
  }),
];

const actionHandlers = [
  http.post(teamUrl('/:tryoutId/candidates/:candidateId/check-in'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/tryouts');
    }
    const record = checkInCandidateRecord(pathParam(params, 'candidateId'));
    return record === null ? failRequest(404, 'NOT_FOUND', '/tryouts') : HttpResponse.json(record);
  }),
  http.post(
    teamUrl('/:tryoutId/candidates/:candidateId/evaluations'),
    async ({ request, params }) => {
      if (!isAuthorized(request)) {
        return failRequest(401, 'UNAUTHORIZED', '/tryouts');
      }
      if (!permissionsForRequest(request).includes(PERMISSIONS.tryoutEvaluate)) {
        return failRequest(403, 'FORBIDDEN', '/tryouts');
      }
      const body = await readJsonBody<EvaluationBody>(request);
      const record = saveEvaluationRecord(
        pathParam(params, 'candidateId'),
        (body.scores ?? []) as never,
        body.note ?? null,
      );
      return record === null
        ? failRequest(404, 'NOT_FOUND', '/tryouts')
        : HttpResponse.json(record);
    },
  ),
  http.post(teamUrl('/:tryoutId/candidates/:candidateId/decision'), async ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/tryouts');
    }
    if (!permissionsForRequest(request).includes(PERMISSIONS.tryoutDecide)) {
      return failRequest(403, 'FORBIDDEN', '/tryouts');
    }
    const body = await readJsonBody<DecisionBody>(request);
    const reason = body.reason ?? '';
    if (body.outcome === undefined || reason.length < 5) {
      return failRequest(400, 'VALIDATION_ERROR', '/tryouts');
    }
    const record = decideCandidateRecord(pathParam(params, 'candidateId'), body.outcome, reason);
    return record === null ? failRequest(404, 'NOT_FOUND', '/tryouts') : HttpResponse.json(record);
  }),
  http.post(teamUrl('/:tryoutId/candidates/:candidateId/conversion'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/tryouts');
    }
    if (!permissionsForRequest(request).includes(PERMISSIONS.tryoutConvert)) {
      return failRequest(403, 'FORBIDDEN', '/tryouts');
    }
    const record = convertCandidateRecord(pathParam(params, 'candidateId'));
    return record === null ? failRequest(404, 'NOT_FOUND', '/tryouts') : HttpResponse.json(record);
  }),
];

/**
 * Tryout handlers. The backend module (prompts 600/601) is not deployed yet,
 * so these are the contract the client is written against; the same Zod
 * schemas will validate the remote responses unchanged.
 */
export const tryoutsHandlers = [...publicHandlers, ...eventHandlers, ...actionHandlers];
