import { http, HttpResponse } from 'msw';

import { PERMISSIONS } from '@/shared/security';

import {
  analyticsSeriesResponse,
  cohortComparisonResponse,
  MOCK_ANALYTICS,
  rebuildReport,
} from './analytics.fixture';
import { apiUrl, failRequest, isAuthorized, pathParam, readJsonBody } from './mock-request.helper';
import { permissionsForRequest, personaFromToken } from './persona-permissions.helper';

function teamUrl(suffix: string): string {
  return apiUrl(`/teams/:teamId/analytics${suffix}`);
}

function has(request: Request, permission: string): boolean {
  return permissionsForRequest(request).includes(permission);
}

function queryValue(request: Request, key: string, fallback: string): string {
  return new URL(request.url).searchParams.get(key) ?? fallback;
}

/** Whether the caller may read a specific player's own series (self grant). */
function readsOwnSeries(request: Request, subjectId: string): boolean {
  const ownMembershipId = personaFromToken(request)?.memberships[0]?.membershipId ?? '';
  return ownMembershipId === subjectId && has(request, PERMISSIONS.analyticsReadSelf);
}

/** The dual-gate decision for a player-series read (B3), as a plain outcome. */
function playerSeriesOutcome(
  request: Request,
  subjectId: string,
): 'ok' | 'not-found' | 'forbidden' {
  if (subjectId === MOCK_ANALYTICS.unknownMemberId) {
    return 'not-found';
  }
  const mayRead = has(request, PERMISSIONS.analyticsReadTeam) || readsOwnSeries(request, subjectId);
  return mayRead ? 'ok' : 'forbidden';
}

/**
 * NestJS-shaped analytics handlers. The player series is dual-gated exactly as
 * the backend is (B3): analytics.read.team reads any player; analytics.read.self
 * reads only the caller's own membership; anything else is a typed 403 with
 * errors.analytics.forbidden. Team series and cohort are analytics.read.team;
 * the rebuild needs data_quality.manage as well.
 */
export const analyticsHandlers = [
  http.get(teamUrl('/players/:subjectId/series'), ({ request, params }) => {
    if (!isAuthorized(request)) {
      return failRequest(401, 'UNAUTHORIZED', '/analytics/players/series');
    }
    const subjectId = pathParam(params, 'subjectId');
    const outcome = playerSeriesOutcome(request, subjectId);
    if (outcome === 'not-found') {
      return failRequest(
        404,
        'NOT_FOUND',
        '/analytics/players/series',
        'errors.analytics.scopeNotFound',
      );
    }
    if (outcome === 'forbidden') {
      return failRequest(
        403,
        'FORBIDDEN',
        '/analytics/players/series',
        'errors.analytics.forbidden',
      );
    }
    return HttpResponse.json(
      analyticsSeriesResponse(queryValue(request, 'dimension', 'overall'), subjectId),
    );
  }),
  http.get(teamUrl('/team/series'), ({ request }) => {
    if (!has(request, PERMISSIONS.analyticsReadTeam)) {
      return failRequest(403, 'FORBIDDEN', '/analytics/team/series');
    }
    return HttpResponse.json(
      analyticsSeriesResponse(queryValue(request, 'dimension', 'attendance')),
    );
  }),
  http.get(teamUrl('/cohorts/comparison'), ({ request }) => {
    if (!has(request, PERMISSIONS.analyticsReadTeam)) {
      return failRequest(403, 'FORBIDDEN', '/analytics/cohorts/comparison');
    }
    return HttpResponse.json(
      cohortComparisonResponse(
        queryValue(request, 'dimension', 'attendance'),
        queryValue(request, 'periodKey', '2026-04'),
      ),
    );
  }),
  http.post(teamUrl('/rebuild'), async ({ request }) => {
    if (
      !has(request, PERMISSIONS.analyticsReadTeam) ||
      !has(request, PERMISSIONS.dataQualityManage)
    ) {
      return failRequest(403, 'FORBIDDEN', '/analytics/rebuild');
    }
    const body = await readJsonBody<{ periodType?: string }>(request);
    return HttpResponse.json(rebuildReport(body.periodType ?? 'monthly'));
  }),
];
