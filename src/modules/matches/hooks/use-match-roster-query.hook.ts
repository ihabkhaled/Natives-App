import { buildMembersDirectoryQueryOptions, type MemberDirectoryPage } from '@/modules/members';
import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { MATCH_ROSTER_PAGE_SIZE } from '../constants/matches-view.constants';

/**
 * The member directory the scoreboard and the statistics table resolve names
 * against. It is a bounded page, and a membership it does not resolve keeps
 * its id rather than disappearing from the statistics table.
 */
export function useMatchRosterQuery(teamId: string): RemoteQueryView<MemberDirectoryPage> {
  return toRemoteQueryView(
    useAppQuery<MemberDirectoryPage>(
      buildMembersDirectoryQueryOptions(teamId, { pageSize: MATCH_ROSTER_PAGE_SIZE }),
    ),
  );
}
