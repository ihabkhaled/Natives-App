import { I18N_KEYS } from '@/shared/i18n';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { AboutContainer } from '../containers/about.container';
import { HomeContainer } from '../containers/home.container';
import { NotFoundContainer } from '../containers/not-found.container';
import { WelcomeContainer } from '../containers/welcome.container';
import { aboutPath, homePath, welcomePath } from './home.paths';

export function getHomeRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: welcomePath(),
      exact: true,
      // PublicOnly, not Public: `/` redirects here, so an authenticated visitor
      // who opens the app root would otherwise land on the signed-out marketing
      // screen and be offered a "Sign in" CTA that leads nowhere. Every other
      // signed-out entry point (login, forgot/reset password, invitation) is
      // already PublicOnly; welcome was the one screen that was not.
      access: ROUTE_ACCESS.PublicOnly,
      component: WelcomeContainer,
    },
    {
      // Public, not PublicOnly: the About page is static marketing content
      // that reads the same whether or not a visitor is signed in.
      path: aboutPath(),
      exact: true,
      access: ROUTE_ACCESS.Public,
      component: AboutContainer,
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
