import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { LoginContainer } from '../containers/login.container';
import { loginPath } from './auth.paths';

export function getAuthRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: loginPath(),
      exact: true,
      access: ROUTE_ACCESS.PublicOnly,
      component: LoginContainer,
    },
  ];
}
