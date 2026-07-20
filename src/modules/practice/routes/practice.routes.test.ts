import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config';
import { PERMISSIONS } from '@/shared/security';
import { NAV_GROUP, ROUTE_ACCESS } from '@/shared/types';

import { getPracticeRouteDefinitions } from './practice.routes';

describe('getPracticeRouteDefinitions', () => {
  it('registers the calendar and detail routes', () => {
    const paths = getPracticeRouteDefinitions().map((definition) => definition.path);

    expect(paths).toEqual([APP_PATHS.practices, APP_PATHS.practiceSession]);
  });

  it('guards both routes behind authentication and the read permission', () => {
    for (const definition of getPracticeRouteDefinitions()) {
      expect(definition.access).toBe(ROUTE_ACCESS.Protected);
      expect(definition.meta?.permissions).toEqual([PERMISSIONS.practicesRead]);
      expect(definition.meta?.requiresTeamContext).toBe(true);
      expect(definition.meta?.offline).toBe(true);
    }
  });

  it('exposes only the calendar as a permission-aware primary destination', () => {
    const [calendar, detail] = getPracticeRouteDefinitions();

    expect(calendar?.meta?.nav).toEqual({
      order: 10,
      group: NAV_GROUP.Team,
      iconName: 'calendar',
      labelKey: 'practice.calendarTitle',
    });
    expect(detail?.meta?.nav).toBeNull();
  });

  it('renders a component for each route', () => {
    for (const definition of getPracticeRouteDefinitions()) {
      expect(definition.component).toBeTypeOf('function');
    }
  });
});
