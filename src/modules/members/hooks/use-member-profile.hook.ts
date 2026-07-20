import { useAppTranslation } from '@/packages/i18n';
import { useAppNavigation, useRouteParam } from '@/packages/router';
import { useNetworkStatus } from '@/platform';

import { MEMBER_AUDIENCE } from '../constants/members.constants';
import { buildMemberProfileView } from '../helpers/member-profile-view.helper';
import { MEMBER_MEMBERSHIP_ID_PARAM, membersPath } from '../routes/members.paths';
import { useMemberAvatar } from './use-member-avatar.hook';
import { useMemberAliases } from './use-member-aliases.hook';
import { useMemberHistory } from './use-member-history.hook';
import { useMemberLifecycle } from './use-member-lifecycle.hook';
import { useMemberProfileQuery } from './use-member-profile-query.hook';
import { useMemberRoles } from './use-member-roles.hook';
import { useMemberSelfEdit } from './use-member-self-edit.hook';
import { useMembersTeamContext } from './use-members-team-context.hook';
import type { MemberProfileView } from '../types/members-view.types';

/** Prepared, translated, permission-tiered member profile with admin panels. */
export function useMemberProfile(): MemberProfileView {
  const { t } = useAppTranslation();
  const navigation = useAppNavigation();
  const network = useNetworkStatus();
  const membershipId = useRouteParam(MEMBER_MEMBERSHIP_ID_PARAM) ?? '';
  const team = useMembersTeamContext();
  const query = useMemberProfileQuery(team.teamId, membershipId);
  const profile = query.profile;
  const isSelf = profile?.audience === MEMBER_AUDIENCE.self && team.canEditSelf;
  const avatar = useMemberAvatar(team.teamId, membershipId, profile, isSelf);
  const selfEdit = useMemberSelfEdit(team.teamId, profile, isSelf);
  const lifecycle = useMemberLifecycle(
    team.teamId,
    membershipId,
    profile?.status,
    team.canManageLifecycle,
  );
  const roles = useMemberRoles(team.teamId, membershipId, team.canManageRoles);
  const aliases = useMemberAliases(team.teamId, membershipId, team.canManageAliases);
  const history = useMemberHistory(team.teamId, membershipId, team.canManageLifecycle);
  return buildMemberProfileView({
    t,
    profile,
    isLoading: team.isLoading || query.isLoading,
    isOffline: !network.isOnline,
    error: query.error,
    onBack: () => {
      navigation.push(membersPath());
    },
    onRetry: query.refetch,
    avatar,
    selfEdit,
    lifecycle,
    roles,
    aliases,
    history,
  });
}
