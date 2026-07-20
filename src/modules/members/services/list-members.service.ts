import { requestMemberDirectory } from '../gateways/members.gateway';
import { runMembersRequest } from '../helpers/to-members-error.helper';
import { mapMemberDirectoryPage } from '../mappers/member.mapper';
import type { MemberDirectoryPage, MembersQueryParams } from '../types/members.types';

/** Use case: load one bounded, deterministically ordered directory page. */
export function listMembers(
  teamId: string,
  params: MembersQueryParams,
): Promise<MemberDirectoryPage> {
  return runMembersRequest(async () =>
    mapMemberDirectoryPage(await requestMemberDirectory(teamId, params.pageSize, 0)),
  );
}
