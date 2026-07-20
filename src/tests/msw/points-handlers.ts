import { http, HttpResponse } from 'msw';

import { apiUrl, isAuthorized } from './mock-request.helper';
import { nestErrorResponse } from './nest-error.helper';
import { leaderboardResponse, MOCK_POINTS, pointsSummaryResponse } from './points.fixture';

function fail(status: number, code: string, path: string): Response {
  return nestErrorResponse({ statusCode: status, code, message: code, path: `/api/v1${path}` });
}

function pointsUrl(suffix: string): string {
  return apiUrl(`/teams/:teamId${suffix}`);
}

/** NestJS-shaped points handlers; the same Zod schemas parse both modes. */
export const pointsHandlers = [
  http.get(pointsUrl('/points'), ({ request }) => {
    if (!isAuthorized(request)) {
      return fail(401, 'UNAUTHORIZED', '/points');
    }
    const url = new URL(request.url);
    return HttpResponse.json(
      leaderboardResponse(
        url.searchParams.get('period') ?? 'season',
        url.searchParams.get('cohort') ?? 'all',
        url.searchParams.get('category'),
      ),
    );
  }),
  http.get(pointsUrl('/my-points'), ({ request }) =>
    isAuthorized(request)
      ? HttpResponse.json(pointsSummaryResponse(MOCK_POINTS.membershipId))
      : fail(401, 'UNAUTHORIZED', '/my-points'),
  ),
  http.get(pointsUrl('/points/:membershipId'), ({ request, params }) =>
    isAuthorized(request)
      ? HttpResponse.json(pointsSummaryResponse(String(params['membershipId'])))
      : fail(401, 'UNAUTHORIZED', '/points'),
  ),
];
