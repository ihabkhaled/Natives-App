import { loadTeamDirectory } from '../services/load-team-directory.service';
import { teamDirectoryQueryKeys } from './team-directory.keys';

/** Query options builder: one team's public directory, by slug. */
export function buildTeamDirectoryQueryOptions(slug: string) {
  return {
    queryKey: teamDirectoryQueryKeys.bySlug(slug),
    queryFn: () => loadTeamDirectory(slug),
  };
}
