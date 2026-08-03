import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS } from '@/shared/types';

import { JerseyContainer } from '../containers/jersey.container';
import { jerseyPagePath } from './jersey.paths';
import { getJerseyRouteDefinitions } from './jersey.routes';

describe('getJerseyRouteDefinitions', () => {
  it('gates the screen on the read grant, not the manage one', () => {
    const [route] = getJerseyRouteDefinitions();

    // The list is team facts; the manage grant only decides who may open an
    // order and read the names being printed.
    expect(route?.path).toBe(jerseyPagePath());
    expect(route?.access).toBe(ROUTE_ACCESS.Protected);
    expect(route?.component).toBe(JerseyContainer);
    expect(route?.meta?.permissions).toEqual([PERMISSIONS.jerseyRead]);
  });

  it('places it in Manage and keeps it readable offline', () => {
    const [route] = getJerseyRouteDefinitions();

    expect(route?.meta?.nav?.group).toBe(NAV_GROUP.Manage);
    expect(route?.meta?.requiresTeamContext).toBe(true);
    expect(route?.meta?.offline).toBe(true);
  });
});
