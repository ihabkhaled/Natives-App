import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { TryoutCandidatesContainer } from '../containers/tryout-candidates.container';
import { tryoutCandidatesPagePath } from './tryout-candidates.paths';

/**
 * The staff review of everyone who registered through the public form.
 *
 * `tryout.manage` opens the screen and nothing more. Contact details and
 * readiness notes each need their own read grant, checked inside the screen and
 * enforced by the backend, which omits those fields entirely for a caller who
 * lacks them.
 *
 * `offline: false` on purpose. Every row is a member of the public who gave
 * this club their contact details; the screen does not advertise itself as
 * readable from a cache on a disconnected device.
 */
export function getTryoutCandidatesRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: tryoutCandidatesPagePath(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: TryoutCandidatesContainer,
      meta: {
        key: 'tryout-candidates',
        titleKey: I18N_KEYS.tryoutCandidates.title,
        permissions: [PERMISSIONS.tryoutManage],
        requiresTeamContext: true,
        offline: false,
        preload: false,
        featureFlag: null,
        nav: {
          order: 51,
          group: NAV_GROUP.Manage,
          iconName: 'person',
          labelKey: I18N_KEYS.tryoutCandidates.navLabel,
        },
      },
    },
  ];
}
