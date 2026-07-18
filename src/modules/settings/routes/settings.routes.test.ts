import { describe, expect, it } from 'vitest';

import { ROUTE_ACCESS } from '@/shared/types';

import { SettingsContainer } from '../containers/settings.container';
import { settingsPath } from './settings.paths';
import { getSettingsRouteDefinitions } from './settings.routes';

describe('getSettingsRouteDefinitions', () => {
  it('exposes exactly one route: the settings screen', () => {
    const definitions = getSettingsRouteDefinitions();

    expect(definitions).toHaveLength(1);
    expect(definitions[0]!.path).toBe(settingsPath());
    expect(definitions[0]!.path).toBe('/settings');
  });

  it('matches the settings path exactly and keeps it public', () => {
    const [settings] = getSettingsRouteDefinitions();

    expect(settings!.exact).toBe(true);
    expect(settings!.access).toBe(ROUTE_ACCESS.Public);
    expect(settings!.access).toBe('public');
  });

  it('wires the settings container as the route component', () => {
    const [settings] = getSettingsRouteDefinitions();

    expect(settings!.component).toBe(SettingsContainer);
  });

  it('is a permission-free primary navigation destination', () => {
    const [settings] = getSettingsRouteDefinitions();

    expect(settings!.meta?.permissions).toEqual([]);
    expect(settings!.meta?.nav).toEqual({
      order: 30,
      iconName: 'settings',
      labelKey: 'nav.settings',
    });
  });
});
