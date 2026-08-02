import { TEAM_DIRECTORY_SEED_RESPONSE } from '../constants/team-directory-seed.constants';
import { mapTeamDirectoryResponse } from '../mappers/team-directory.mapper';
import type { TeamDirectory } from '../types/team-directory.types';

/**
 * TODO(team-directory-endpoint): THIS FILE IS THE SEAM.
 *
 * Contract 1.8.0 adds `GET /public/teams/{slug}/directory` (@Public: team
 * profile + staff-with-titles + active players). It is not in the generated
 * contract types yet, so inventing a gateway call to it would fail for every
 * visitor. Instead this use case takes the exact `{slug}` the real endpoint
 * takes, and resolves the pinned seed payload — already shaped as
 * `TeamDirectoryResponseDto` — through the same mapper the live response will
 * go through.
 *
 * Wiring the real endpoint is a one-file change here:
 *
 *   const dto = await requestTeamDirectory(slug);   // gateway + response schema
 *   return mapTeamDirectoryResponse(dto);
 *
 * ...plus flipping `TEAM_DIRECTORY_ENDPOINT_LIVE` in
 * `team-directory.constants.ts` to drop the "coming soon" notice. The query,
 * hooks, view model, and every component keep this exact signature and need no
 * edits; `constants/team-directory-seed.constants.ts` is then deleted.
 */
export async function loadTeamDirectory(slug: string): Promise<TeamDirectory> {
  void slug;
  return Promise.resolve(mapTeamDirectoryResponse(TEAM_DIRECTORY_SEED_RESPONSE));
}
