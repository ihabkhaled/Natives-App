import { useState } from 'react';

import { useAppTranslation } from '@/packages/i18n';
import { useAppQuery } from '@/packages/query';
import { useAppNavigation } from '@/packages/router';
import { toAppError } from '@/shared/errors/app-error.helper';
import { useNetworkStatus } from '@/platform';

import { MEMBERS_PAGE_SIZE, type MembershipStatus } from '../constants/members.constants';
import { buildMembersDirectoryView } from '../helpers/members-directory-view.helper';
import { buildMembersDirectoryQueryOptions } from '../queries/members-directory.query';
import { memberProfilePath } from '../routes/members.paths';
import { useInviteMember } from './use-invite-member.hook';
import { useMembersTeamContext } from './use-members-team-context.hook';
import type { MembersDirectoryView } from '../types/members-view.types';

/** Prepared, translated, offline- and permission-aware member directory. */
export function useMembersDirectory(): MembersDirectoryView {
  const { t } = useAppTranslation();
  const navigation = useAppNavigation();
  const network = useNetworkStatus();
  const team = useMembersTeamContext();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<MembershipStatus | null>(null);
  const [position, setPosition] = useState<string | null>(null);
  const query = useAppQuery(
    buildMembersDirectoryQueryOptions(team.teamId, { pageSize: MEMBERS_PAGE_SIZE }),
  );
  const invite = useInviteMember(team.teamId, team.canInvite);
  return buildMembersDirectoryView({
    t,
    page: query.data,
    isLoading: team.isLoading || query.isPending,
    isOffline: !network.isOnline,
    error: query.error === null ? null : toAppError(query.error),
    search,
    status,
    position,
    onSearchChange: setSearch,
    onStatusChange: setStatus,
    onPositionChange: setPosition,
    onRetry: () => {
      void query.refetch();
    },
    onSelectMember: (membershipId) => {
      navigation.push(memberProfilePath(membershipId));
    },
    invite,
  });
}
