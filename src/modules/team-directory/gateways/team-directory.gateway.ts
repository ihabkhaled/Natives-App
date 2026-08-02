import { getAppHttpClient } from '@/packages/http';

import { publicTeamDirectoryPath } from '../constants/team-directory-api.constants';
import { publicTeamDirectoryResponseSchema } from '../schemas/team-directory.schema';
import type { TeamDirectoryResponseDto } from '../types/team-directory.types';

/** Public: the team profile, season board and active roster. No session required. */
export function requestPublicTeamDirectory(slug: string): Promise<TeamDirectoryResponseDto> {
  return getAppHttpClient().get(publicTeamDirectoryPath(slug), publicTeamDirectoryResponseSchema);
}
