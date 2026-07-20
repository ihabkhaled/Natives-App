import { I18N_KEYS } from '@/shared/i18n';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { TryoutDetailContainer } from '../containers/tryout-detail.container';
import { TryoutRegistrationContainer } from '../containers/tryout-registration.container';
import { TryoutsContainer } from '../containers/tryouts.container';
import { tryoutDetailPattern, tryoutRegistrationPath, tryoutsPath } from './tryouts.paths';

/**
 * Candidate registration is public by design: a prospective member has no
 * account yet. It is the only public tryout surface, and it reads nothing but
 * the open-event list.
 */
function registrationRoute(): AppRouteDefinition {
  return {
    path: tryoutRegistrationPath(),
    exact: true,
    access: ROUTE_ACCESS.Public,
    component: TryoutRegistrationContainer,
    meta: {
      key: 'tryout-registration',
      titleKey: I18N_KEYS.tryouts.registrationTitle,
      permissions: [],
      requiresTeamContext: false,
      offline: false,
      preload: false,
      featureFlag: null,
      nav: null,
    },
  };
}

function tryoutsRoute(): AppRouteDefinition {
  return {
    path: tryoutsPath(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: TryoutsContainer,
    meta: {
      key: 'tryouts',
      titleKey: I18N_KEYS.tryouts.title,
      permissions: [PERMISSIONS.tryoutManage],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: {
        order: 50,
        group: NAV_GROUP.Manage,
        iconName: 'flask',
        labelKey: I18N_KEYS.tryouts.navLabel,
      },
    },
  };
}

function tryoutDetailRoute(): AppRouteDefinition {
  return {
    path: tryoutDetailPattern(),
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: TryoutDetailContainer,
    meta: {
      key: 'tryout-detail',
      titleKey: I18N_KEYS.tryouts.detailTitle,
      permissions: [PERMISSIONS.tryoutManage],
      requiresTeamContext: true,
      offline: true,
      preload: false,
      featureFlag: null,
      nav: null,
    },
  };
}

/**
 * Tryout routes. Staff screens require `tryout.manage`; contact, readiness,
 * decision, and conversion capabilities are gated inside the screen by their
 * own grants and re-authorized by the backend.
 */
export function getTryoutsRouteDefinitions(): readonly AppRouteDefinition[] {
  return [registrationRoute(), tryoutsRoute(), tryoutDetailRoute()];
}
