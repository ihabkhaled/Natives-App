import { http, HttpResponse } from 'msw';

import {
  competitionFixturesResponse,
  competitionResponse,
  competitionStructureResponse,
  competitionsResponse,
  opponentsResponse,
} from './competitions.fixture';
import { apiUrl, failRequest, isAuthorized, pathParam, readJsonBody } from './mock-request.helper';
import {
  availabilityResponse,
  declareAvailability,
  eligibilityResponse,
  removeCandidate,
  selectCandidate,
  selectionsResponse,
  squadResponse,
  squadsResponse,
  transitionSquadRecord,
} from './squads.fixture';

interface SelectBody {
  readonly membershipId?: string;
  readonly overrideReason?: string;
}

interface AvailabilityBody {
  readonly availability?: 'available' | 'unavailable' | 'tentative';
  readonly reason?: string | null;
}

interface TransitionBody {
  readonly transition?: 'publish' | 'lock' | 'revise' | 'archive';
  readonly expectedRecordVersion?: number;
}

function teamUrl(suffix: string): string {
  return apiUrl(`/teams/:teamId${suffix}`);
}

const competitionHandlers = [
  http.get(teamUrl('/competitions'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(competitionsResponse())
      : failRequest(401, 'UNAUTHORIZED', '/competitions'),
  ),
  http.get(teamUrl('/competitions/:competitionId'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/competitions');
    }
    const record = competitionResponse(pathParam(params, 'competitionId'));
    return record === null
      ? failRequest(404, 'NOT_FOUND', '/competitions')
      : HttpResponse.json(record);
  }),
  http.get(teamUrl('/competitions/:competitionId/structure'), ({ request, params }) =>
    isAuthorized(request)
      ? HttpResponse.json(competitionStructureResponse(pathParam(params, 'competitionId')))
      : failRequest(401, 'UNAUTHORIZED', '/competitions'),
  ),
  http.get(teamUrl('/competitions/:competitionId/fixtures'), ({ request, params }) =>
    isAuthorized(request)
      ? HttpResponse.json(competitionFixturesResponse(pathParam(params, 'competitionId')))
      : failRequest(401, 'UNAUTHORIZED', '/competitions'),
  ),
  http.get(teamUrl('/opponents'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(opponentsResponse())
      : failRequest(401, 'UNAUTHORIZED', '/opponents'),
  ),
];

const squadReadHandlers = [
  http.get(teamUrl('/squads'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(squadsResponse())
      : failRequest(401, 'UNAUTHORIZED', '/squads'),
  ),
  http.get(teamUrl('/squads/:squadId'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/squads');
    }
    const record = squadResponse(pathParam(params, 'squadId'));
    return record === null ? failRequest(404, 'NOT_FOUND', '/squads') : HttpResponse.json(record);
  }),
  http.get(teamUrl('/squads/:squadId/eligibility'), ({ request, params }) =>
    isAuthorized(request)
      ? HttpResponse.json(eligibilityResponse(pathParam(params, 'squadId')))
      : failRequest(401, 'UNAUTHORIZED', '/squads'),
  ),
  http.get(teamUrl('/squads/:squadId/selections'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(selectionsResponse())
      : failRequest(401, 'UNAUTHORIZED', '/squads'),
  ),
  http.get(teamUrl('/squads/:squadId/availability'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(availabilityResponse())
      : failRequest(401, 'UNAUTHORIZED', '/squads'),
  ),
];

const squadWriteHandlers = [
  http.post(teamUrl('/squads/:squadId/selections'), async ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/squads');
    }
    const body = await readJsonBody<SelectBody>(request);
    if (body.membershipId === undefined) {
      return failRequest(400, 'VALIDATION_ERROR', '/squads');
    }
    return HttpResponse.json(selectCandidate(body.membershipId, null), { status: 201 });
  }),
  http.post(teamUrl('/squads/:squadId/selections/override'), async ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/squads');
    }
    const body = await readJsonBody<SelectBody>(request);
    const reason = body.overrideReason ?? '';
    if (body.membershipId === undefined || reason.length < 5) {
      return failRequest(400, 'VALIDATION_ERROR', '/squads');
    }
    return HttpResponse.json(selectCandidate(body.membershipId, reason), { status: 201 });
  }),
  http.post(teamUrl('/squads/:squadId/selections/:membershipId/removal'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/squads');
    }
    const record = removeCandidate(pathParam(params, 'membershipId'));
    return record === null ? failRequest(404, 'NOT_FOUND', '/squads') : HttpResponse.json(record);
  }),
  http.post(teamUrl('/squads/:squadId/availability'), async ({ request }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/squads');
    }
    const body = await readJsonBody<AvailabilityBody>(request);
    if (body.availability === undefined) {
      return failRequest(400, 'VALIDATION_ERROR', '/squads');
    }
    const record = declareAvailability(body.availability, body.reason ?? null);
    return HttpResponse.json(record, { status: 201 });
  }),
  http.post(teamUrl('/squads/:squadId/transition'), async ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/squads');
    }
    const body = await readJsonBody<TransitionBody>(request);
    if (body.transition === undefined) {
      return failRequest(400, 'VALIDATION_ERROR', '/squads');
    }
    const result = transitionSquadRecord(
      pathParam(params, 'squadId'),
      body.transition,
      body.expectedRecordVersion ?? 0,
    );
    if (result === 'not-found') {
      return failRequest(404, 'NOT_FOUND', '/squads');
    }
    return result === 'conflict'
      ? failRequest(409, 'VERSION_CONFLICT', '/squads')
      : HttpResponse.json(result);
  }),
];

/** NestJS-shaped competitions handlers; the same Zod schemas parse both modes. */
export const competitionsHandlers = [
  ...competitionHandlers,
  ...squadReadHandlers,
  ...squadWriteHandlers,
];
