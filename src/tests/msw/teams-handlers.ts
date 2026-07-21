import { http, HttpResponse } from 'msw';

import { apiUrl, failRequest, readJsonBody } from './mock-request.helper';
import { personaFromToken } from './persona-permissions.helper';
import {
  MOCK_DRAFT_SEASON,
  MOCK_ROLE_MATRIX,
  MOCK_SEASON,
  MOCK_SECOND_TEAM,
  MOCK_TEAM,
} from './teams.fixture';

const PLATFORM_BROWSE = 'team.browse.all';
const PLATFORM_CREATE = 'team.create';
const SEASON_MANAGE = 'season.manage';
const ROLES_MANAGE = 'member.roles.manage';

function grantsOf(request: Request): readonly string[] | null {
  return personaFromToken(request)?.permissions ?? null;
}

function envelope(items: readonly Record<string, unknown>[]): Record<string, unknown> {
  return { items: [...items], total: items.length, limit: 50, offset: 0 };
}

/**
 * Teams, seasons, and the RBAC catalog.
 *
 * The scope split is the point of these handlers: `/teams` is a PLATFORM route
 * that only `team.browse.all` satisfies, while `/teams/mine` answers for any
 * signed-in member. Mirroring that here is what lets the e2e suite prove a team
 * administrator is refused browse-all instead of merely believing it.
 */
export const teamsHandlers = [
  http.get(apiUrl('/rbac/me/permissions'), ({ request }) => {
    const grants = grantsOf(request);
    return grants === null
      ? failRequest(401, 'UNAUTHORIZED', '/rbac/me/permissions')
      : HttpResponse.json({ permissions: grants });
  }),
  http.get(apiUrl('/rbac/role-bundles'), ({ request }) => {
    const grants = grantsOf(request);
    if (grants === null) {
      return failRequest(401, 'UNAUTHORIZED', '/rbac/role-bundles');
    }
    return grants.includes(ROLES_MANAGE)
      ? HttpResponse.json(MOCK_ROLE_MATRIX)
      : failRequest(403, 'FORBIDDEN', '/rbac/role-bundles');
  }),
  http.get(apiUrl('/teams/mine'), ({ request }) =>
    grantsOf(request) === null
      ? failRequest(401, 'UNAUTHORIZED', '/teams/mine')
      : HttpResponse.json(envelope([MOCK_TEAM])),
  ),
  http.get(apiUrl('/teams'), ({ request }) => {
    const grants = grantsOf(request);
    if (grants === null) {
      return failRequest(401, 'UNAUTHORIZED', '/teams');
    }
    return grants.includes(PLATFORM_BROWSE)
      ? HttpResponse.json(envelope([MOCK_TEAM, MOCK_SECOND_TEAM]))
      : failRequest(403, 'FORBIDDEN', '/teams');
  }),
  http.post(apiUrl('/teams'), async ({ request }) => {
    const grants = grantsOf(request);
    if (grants?.includes(PLATFORM_CREATE) !== true) {
      return failRequest(grants === null ? 401 : 403, 'FORBIDDEN', '/teams');
    }
    const body = await readJsonBody<{ slug?: string; name?: string }>(request);
    return HttpResponse.json(
      {
        ...MOCK_TEAM,
        id: 'team-new',
        slug: body.slug ?? 'new-team',
        name: body.name ?? 'New team',
      },
      { status: 201 },
    );
  }),
  http.patch(apiUrl('/teams/:teamId'), async ({ request }) => {
    const body = await readJsonBody<{ name?: string }>(request);
    return HttpResponse.json({ ...MOCK_TEAM, name: body.name ?? MOCK_TEAM.name, version: 2 });
  }),
  http.post(apiUrl('/teams/:teamId/deactivate'), () =>
    HttpResponse.json({ ...MOCK_TEAM, status: 'disabled', version: 2 }),
  ),
  http.post(apiUrl('/teams/:teamId/activate'), () =>
    HttpResponse.json({ ...MOCK_TEAM, status: 'active', version: 2 }),
  ),
  http.post(apiUrl('/teams/:teamId/archive'), () =>
    HttpResponse.json({ ...MOCK_TEAM, status: 'archived', version: 2 }),
  ),
  http.get(apiUrl('/teams/:teamId/seasons/current'), ({ request }) =>
    grantsOf(request) === null
      ? failRequest(401, 'UNAUTHORIZED', '/seasons/current')
      : HttpResponse.json(MOCK_SEASON),
  ),
  // GET /seasons is served by the admin handlers, which are the single source
  // for the seeded season list both the settings screen and this one read.
  http.post(apiUrl('/teams/:teamId/seasons'), async ({ request }) => {
    const grants = grantsOf(request);
    if (grants?.includes(SEASON_MANAGE) !== true) {
      return failRequest(grants === null ? 401 : 403, 'FORBIDDEN', '/seasons');
    }
    const body = await readJsonBody<{ slug?: string; name?: string }>(request);
    return HttpResponse.json(
      {
        ...MOCK_DRAFT_SEASON,
        id: 'season-new',
        slug: body.slug ?? 'new-season',
        name: body.name ?? 'New season',
      },
      { status: 201 },
    );
  }),
  http.patch(apiUrl('/teams/:teamId/seasons/:seasonId'), async ({ request }) => {
    const body = await readJsonBody<{ name?: string }>(request);
    return HttpResponse.json({ ...MOCK_SEASON, name: body.name ?? MOCK_SEASON.name, version: 2 });
  }),
  // Exactly one active season per team: activating the draft while another is
  // already active is the conflict the screen has to explain, not retry.
  http.post(apiUrl('/teams/:teamId/seasons/:seasonId/activate'), ({ params }) =>
    params['seasonId'] === MOCK_DRAFT_SEASON.id
      ? failRequest(409, 'CONFLICT', '/seasons/activate', 'errors.teams.seasonAlreadyActive')
      : HttpResponse.json({ ...MOCK_SEASON, status: 'active', version: 2 }),
  ),
  http.post(apiUrl('/teams/:teamId/seasons/:seasonId/close'), () =>
    HttpResponse.json({ ...MOCK_SEASON, status: 'closed', version: 2 }),
  ),
  http.post(apiUrl('/teams/:teamId/seasons/:seasonId/archive'), () =>
    HttpResponse.json({ ...MOCK_SEASON, status: 'archived', version: 2 }),
  ),
];
