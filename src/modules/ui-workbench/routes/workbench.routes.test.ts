import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getExecutionContext } from '@/platform';
import { ROUTE_ACCESS } from '@/shared/types';

import { WorkbenchContainer } from '../containers/workbench.container';
import { workbenchPath } from './workbench.paths';
import { getWorkbenchRouteDefinitions } from './workbench.routes';

vi.mock('@/platform', () => ({ getExecutionContext: vi.fn() }));

const getExecutionContextMock = vi.mocked(getExecutionContext);

function runningInProduction(isProduction: boolean): void {
  getExecutionContextMock.mockReturnValue({
    apiMode: 'remote',
    isDevelopment: !isProduction,
    isProduction,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  runningInProduction(false);
});

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

  /**
   * The gallery renders mock records and every loading, error, conflict and
   * empty state in the design system. Published as a public production route
   * it hands a signed-out visitor an internal surface, so it must not be
   * registered at all there — the path then falls through to the catch-all
   * not-found route like any other unknown URL.
   */
  it('registers nothing in production', () => {
    runningInProduction(true);

    expect(getWorkbenchRouteDefinitions()).toEqual([]);
  });
});
