import { I18N_KEYS } from '@/shared/i18n';
import { NAV_GROUP, ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { AboutContainer } from '../containers/about.container';
import { HomeContainer } from '../containers/home.container';
import { LandingContainer } from '../containers/landing.container';
import { NotFoundContainer } from '../containers/not-found.container';
import { WelcomeContainer } from '../containers/welcome.container';
import { aboutPath, homePath, rootPath, welcomePath } from './home.paths';

export function getHomeRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      // Public, not PublicOnly: `/` is the site's front door — the full
      // marketing landing page — and must read the same for an anonymous
      // visitor and a signed-in one; nobody should be bounced away from it.
      path: rootPath(),
      exact: true,
      access: ROUTE_ACCESS.Public,
      component: LandingContainer,
    },
    {
      path: welcomePath(),
      exact: true,
      // PublicOnly: `/welcome` is the lightweight signed-out app entry (a
      // sign-in CTA, nothing else) kept working for existing deep links; the
      // full marketing site now lives at `/`. Showing it to an authenticated
      // visitor would offer a "Sign in" CTA that leads nowhere.
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
