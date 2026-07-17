import { describe, expect, it } from 'vitest';

import { ROUTE_ACCESS } from '@/shared/types';

import { WorkbenchContainer } from '../containers/workbench.container';
import { workbenchPath } from './workbench.paths';
import { getWorkbenchRouteDefinitions } from './workbench.routes';

describe('getWorkbenchRouteDefinitions', () => {
  it('exposes exactly one route: the workbench screen', () => {
    const definitions = getWorkbenchRouteDefinitions();

    expect(definitions).toHaveLength(1);
    expect(definitions[0]!.path).toBe(workbenchPath());
    expect(definitions[0]!.path).toBe('/workbench');
  });

  it('matches the workbench path exactly and keeps it public', () => {
    const [workbench] = getWorkbenchRouteDefinitions();

    expect(workbench!.exact).toBe(true);
    expect(workbench!.access).toBe(ROUTE_ACCESS.Public);
    expect(workbench!.access).toBe('public');
  });

  it('wires the workbench container as the route component', () => {
    const [workbench] = getWorkbenchRouteDefinitions();

    expect(workbench!.component).toBe(WorkbenchContainer);
  });
});
