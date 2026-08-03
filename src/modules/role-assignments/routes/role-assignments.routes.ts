import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { RoleAssignmentsContainer } from '../containers/role-assignments.container';
import { roleAssignmentsPagePath } from './role-assignments.paths';

/**
 * The RBAC admin screen.
 *
 * Gated on `member.roles.manage` — the grant that already governs changing who
 * holds what. There is no read-only variant: an assignment list is only useful
 * to a principal who could act on it, and publishing "who has access to what"
 * more widely than the ability to change it is its own disclosure.
 *
 * `offline: false` is deliberate. Every other screen here caches happily, but
 * a stale picture of who holds which role is the one thing an administrator
 * must never act on: revoking against a list from an hour ago is how the wrong
 * person keeps their access.
 */
export function getRoleAssignmentsRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: roleAssignmentsPagePath(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: RoleAssignmentsContainer,
      meta: {
        key: 'role-assignments',
        titleKey: I18N_KEYS.roleAssignments.title,
        permissions: [PERMISSIONS.memberRolesManage],
        requiresTeamContext: true,
        offline: false,
        preload: false,
        featureFlag: null,
        nav: {
          order: 28,
          group: NAV_GROUP.Manage,
          iconName: 'shield',
          labelKey: I18N_KEYS.roleAssignments.navLabel,
        },
      },
    },
  ];
}
