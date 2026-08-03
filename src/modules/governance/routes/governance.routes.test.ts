import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS } from '@/shared/types';

import { GovernanceContainer } from '../containers/governance.container';
import { governancePagePath } from './governance.paths';
import { getGovernanceRouteDefinitions } from './governance.routes';

describe('getGovernanceRouteDefinitions', () => {
  it('registers the board record behind the governance read grant', () => {
    const [route] = getGovernanceRouteDefinitions();

    expect(route?.path).toBe(governancePagePath());
    expect(route?.access).toBe(ROUTE_ACCESS.Protected);
    expect(route?.component).toBe(GovernanceContainer);
    expect(route?.meta?.permissions).toEqual([PERMISSIONS.governanceRead]);
  });

  it('places it in Manage and keeps it readable offline', () => {
    const [route] = getGovernanceRouteDefinitions();

    expect(route?.meta?.nav?.group).toBe(NAV_GROUP.Manage);
    expect(route?.meta?.requiresTeamContext).toBe(true);
    expect(route?.meta?.offline).toBe(true);
  });
});
