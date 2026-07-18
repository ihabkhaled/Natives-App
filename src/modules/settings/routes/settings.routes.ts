import { I18N_KEYS } from '@/shared/i18n';
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
      meta: {
        key: 'settings',
        titleKey: I18N_KEYS.settings.title,
        permissions: [],
        requiresTeamContext: false,
        offline: true,
        preload: false,
        featureFlag: null,
        nav: { order: 30, iconName: 'settings', labelKey: I18N_KEYS.nav.settings },
      },
    },
  ];
}
