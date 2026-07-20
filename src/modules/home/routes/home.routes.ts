import { I18N_KEYS } from '@/shared/i18n';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { HomeContainer } from '../containers/home.container';
import { NotFoundContainer } from '../containers/not-found.container';
import { WelcomeContainer } from '../containers/welcome.container';
import { homePath, welcomePath } from './home.paths';

export function getHomeRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: welcomePath(),
      exact: true,
      access: ROUTE_ACCESS.Public,
      component: WelcomeContainer,
    },
    {
      path: homePath(),
      exact: true,
      access: ROUTE_ACCESS.Protected,
      component: HomeContainer,
      meta: {
        key: 'home',
        titleKey: I18N_KEYS.home.title,
        permissions: [],
        requiresTeamContext: false,
        offline: true,
        preload: true,
        featureFlag: null,
        nav: {
          order: 0,
          group: NAV_GROUP.Overview,
          iconName: 'home',
          labelKey: I18N_KEYS.nav.home,
        },
      },
    },
  ];
}

/** Catch-all: must be registered last by the app router. */
export function getNotFoundRouteDefinition(): AppRouteDefinition {
  return {
    path: '*',
    exact: false,
    access: ROUTE_ACCESS.Public,
    component: NotFoundContainer,
  };
}
