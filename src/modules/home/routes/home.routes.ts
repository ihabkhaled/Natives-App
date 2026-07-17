import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

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
