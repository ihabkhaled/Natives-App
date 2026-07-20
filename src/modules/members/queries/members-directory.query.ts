import { listMembers } from '../services/list-members.service';
import type { MemberDirectoryPage, MembersQueryParams } from '../types/members.types';
import { membersQueryKeys } from './members.keys';

/**
 * Query options for one bounded directory page. `placeholderData` keeps the
 * previous page visible while a "show more" fetches a larger window, so the
 * list never collapses into a spinner.
 */
export function buildMembersDirectoryQueryOptions(teamId: string, params: MembersQueryParams) {
  return {
    queryKey: membersQueryKeys.directory(teamId, params),
    queryFn: () => listMembers(teamId, params),
    enabled: teamId !== '',
    placeholderData: (previous: MemberDirectoryPage | undefined) => previous,
  };
}
