import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { MemberProfileContainer } from '../containers/member-profile.container';
import { MembersDirectoryContainer } from '../containers/members-directory.container';
import { memberProfilePattern, membersPath } from './members.paths';

/**
 * Member directory and profile routes. Both are gated: the directory on
 * member.list, the profile on member.profile.read.public. The guard blocks a
 * direct URL for any persona without the grant; the backend re-authorises every
 * read and shapes the profile to the viewer's resolved audience.
 */
export function getMembersRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: membersPath(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: MembersDirectoryContainer,
      meta: {
        key: 'members',
        titleKey: I18N_KEYS.members.title,
        permissions: [PERMISSIONS.memberList],
        requiresTeamContext: true,
        offline: true,
        preload: false,
        featureFlag: null,
        nav: {
          order: 15,
          group: NAV_GROUP.Team,
          iconName: 'people',
          labelKey: I18N_KEYS.members.title,
        },
      },
    },
    {
      path: memberProfilePattern(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: MemberProfileContainer,
      meta: {
        key: 'member-profile',
        titleKey: I18N_KEYS.members.profileTitle,
        permissions: [PERMISSIONS.memberProfileReadPublic],
        requiresTeamContext: true,
        offline: true,
        preload: false,
        featureFlag: null,
        nav: null,
      },
    },
  ];
}
