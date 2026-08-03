import { describe, expect, it } from 'vitest';

import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS } from '@/shared/types';

import { DataQualityContainer } from '../containers/data-quality.container';
import { dataQualityPagePath } from './data-quality.paths';
import { getDataQualityRouteDefinitions } from './data-quality.routes';

describe('getDataQualityRouteDefinitions', () => {
  it('registers the queue behind the single data-quality grant', () => {
    const [route] = getDataQualityRouteDefinitions();

    expect(route?.path).toBe(dataQualityPagePath());
    expect(route?.access).toBe(ROUTE_ACCESS.Protected);
    expect(route?.component).toBe(DataQualityContainer);
    expect(route?.meta?.permissions).toEqual([PERMISSIONS.dataQualityManage]);
  });

  it('places it in Manage and keeps it readable offline', () => {
    const [route] = getDataQualityRouteDefinitions();

    expect(route?.meta?.nav?.group).toBe(NAV_GROUP.Manage);
    expect(route?.meta?.requiresTeamContext).toBe(true);
    expect(route?.meta?.offline).toBe(true);
  });
});
