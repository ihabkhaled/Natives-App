import { http, HttpResponse } from 'msw';

import { TEAM_DIRECTORY_SLUG } from '@/modules/team-directory';

import { apiUrl, failRequest, pathParam } from './mock-request.helper';
import { MOCK_TEAM_DIRECTORY } from './team-directory.fixture';

const DIRECTORY_PATH = '/public/teams/:slug/directory';

/**
 * The public team directory (contract 1.8.0), mocked ahead of the deployment.
 *
 * The app does not call this route yet — `loadTeamDirectory` is still a stub
 * seam — but pinning the handler here means the response shape is exercised by
 * the integration suite today, and the gateway that replaces the seam has a
 * mock waiting for it. Unauthenticated on purpose: it is an @Public route.
 */
export const teamDirectoryHandlers = [
  http.get(apiUrl(DIRECTORY_PATH), ({ params }) =>
    pathParam(params, 'slug') === TEAM_DIRECTORY_SLUG
      ? HttpResponse.json(MOCK_TEAM_DIRECTORY)
      : failRequest(404, 'NOT_FOUND', DIRECTORY_PATH),
  ),
];
