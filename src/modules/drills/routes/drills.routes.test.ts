import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';
import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { DrillDetailContainer } from '../containers/drill-detail.container';
import { DrillsCatalogueContainer } from '../containers/drills-catalogue.container';
import { drillDetailPattern, drillsPath } from './drills.paths';
import { getDrillsRouteDefinitions } from './drills.routes';

/** Fail loudly rather than chaining `?.` through every assertion below. */
function expectDefined(route: AppRouteDefinition | undefined): AppRouteDefinition {
  expect(route).toBeDefined();
  if (route === undefined) {
    throw new Error('route missing');
  }
  return route;
}

describe('getDrillsRouteDefinitions', () => {
  it('registers the list behind the one drill grant, with a nav entry', () => {
    const list = expectDefined(getDrillsRouteDefinitions()[0]);

    expect(list.path).toBe(drillsPath());
    expect(list.access).toBe(ROUTE_ACCESS.Protected);
    expect(list.component).toBe(DrillsCatalogueContainer);
    const meta = list.meta;
    expect(meta?.permissions).toEqual([PERMISSIONS.drillManage]);
    expect(meta?.requiresTeamContext).toBe(true);
    expect(meta?.offline).toBe(true);
    expect(meta?.nav).not.toBeNull();
  });

  it('registers the detail/edit route behind the same grant, offline and off nav', () => {
    const detail = expectDefined(getDrillsRouteDefinitions()[1]);

    expect(detail.path).toBe(drillDetailPattern());
    expect(detail.access).toBe(ROUTE_ACCESS.Protected);
    expect(detail.component).toBe(DrillDetailContainer);
    const meta = detail.meta;
    expect(meta?.permissions).toEqual([PERMISSIONS.drillManage]);
    // Writing is the whole point of this screen; an offline shell could only
    // show stale fields beside controls that cannot save.
    expect(meta?.offline).toBe(false);
    expect(meta?.nav).toBeNull();
  });

  it('registers exactly the two routes', () => {
    expect(getDrillsRouteDefinitions()).toHaveLength(2);
  });
});
