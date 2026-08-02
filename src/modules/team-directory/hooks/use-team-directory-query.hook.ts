import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildTeamDirectoryQueryOptions } from '../queries/team-directory.query';
import type { TeamDirectory } from '../types/team-directory.types';

/**
 * The public directory read, normalized. Today the query function resolves the
 * seam's seed payload; once contract 1.8.0 is wired up it resolves the live
 * response — this hook is unaffected either way.
 */
export function useTeamDirectoryQuery(slug: string): RemoteQueryView<TeamDirectory> {
  const query = useAppQuery<TeamDirectory>(buildTeamDirectoryQueryOptions(slug));
  return toRemoteQueryView(query);
}
