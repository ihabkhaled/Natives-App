import { requestPublicTeamDirectory } from '../gateways/team-directory.gateway';
import { mapTeamDirectoryResponse } from '../mappers/team-directory.mapper';
import type { TeamDirectory } from '../types/team-directory.types';

/**
 * Loads the public team page from `GET /public/teams/{slug}/directory` — the
 * team profile, the season board with each member's titles, and the active
 * roster.
 *
 * The endpoint is unauthenticated, so this resolves for a visitor with no
 * session. Everything the page shows is normalized in one place, by the
 * mapper, rather than per component.
 */
export async function loadTeamDirectory(slug: string): Promise<TeamDirectory> {
  const dto = await requestPublicTeamDirectory(slug);

  return mapTeamDirectoryResponse(dto);
}
