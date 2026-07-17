import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { SettingsContainer } from '../containers/settings.container';
import { settingsPath } from './settings.paths';

export function getSettingsRouteDefinitions(): readonly AppRouteDefinition[] {
  return [
    {
      path: settingsPath(),
      exact: true,
      access: ROUTE_ACCESS.Public,
      component: SettingsContainer,
    },
  ];
}
