import { describe, expect, it } from 'vitest';

import type { FeatureFlag } from '@/shared/config';
import { PERMISSIONS } from '@/shared/security';
import {
  ROUTE_ACCESS,
  type AppRouteDefinition,
  type NavMeta,
  type RouteMeta,
} from '@/shared/types';

import { selectVisibleNavItems } from './nav-visibility.helper';
import type { NavVisibilityContext } from './navigation.types';

function DummyScreen(): React.JSX.Element {
  return <div>screen</div>;
}

function route(
  path: string,
  metaOverrides: Partial<RouteMeta> | null,
  navOverrides: Partial<NavMeta> | null = {},
): AppRouteDefinition {
  const nav: NavMeta | null =
    navOverrides === null
      ? null
      : { order: 0, iconName: 'home', labelKey: 'nav.home', ...navOverrides };
  const base: AppRouteDefinition = {
    path,
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: DummyScreen,
  };
  if (metaOverrides === null) {
    return base;
  }
  return {
    ...base,
    meta: {
      key: path.replace('/', ''),
      titleKey: 'home.title',
      permissions: [],
      requiresTeamContext: false,
      offline: false,
      preload: false,
      featureFlag: null,
      nav,
      ...metaOverrides,
    },
  };
}

const adminContext: NavVisibilityContext = {
  permissions: [PERMISSIONS.usersManage],
  hasTeamContext: true,
};

describe('selectVisibleNavItems', () => {
  it('drops routes with no metadata and routes that opt out of navigation', () => {
    const routes = [route('/no-meta', null), route('/hidden', {}, null)];

    expect(selectVisibleNavItems(routes, adminContext)).toEqual([]);
  });

  it('orders the surviving destinations by their nav order', () => {
    const routes = [
      route('/settings', { key: 'settings' }, { order: 30, labelKey: 'nav.settings' }),
      route('/home', { key: 'home' }, { order: 0, labelKey: 'nav.home' }),
    ];

    expect(selectVisibleNavItems(routes, adminContext).map((item) => item.path)).toEqual([
      '/home',
      '/settings',
    ]);
  });

  it('hides a route whose feature flag is switched off', () => {
    const routes = [route('/admin', { featureFlag: 'off-flag' as FeatureFlag })];

    expect(selectVisibleNavItems(routes, adminContext)).toEqual([]);
  });

  it('hides a route whose required permission is not granted', () => {
    const routes = [route('/admin', { permissions: [PERMISSIONS.usersManage] })];
    const memberContext: NavVisibilityContext = {
      permissions: [PERMISSIONS.membersRead],
      hasTeamContext: true,
    };

    expect(selectVisibleNavItems(routes, memberContext)).toEqual([]);
  });

  it('hides a team-scoped route when there is no active team context', () => {
    const routes = [route('/roster', { requiresTeamContext: true })];
    const noTeamContext: NavVisibilityContext = {
      permissions: [PERMISSIONS.usersManage],
      hasTeamContext: false,
    };

    expect(selectVisibleNavItems(routes, noTeamContext)).toEqual([]);
  });

  it('keeps a permitted, in-context destination with its icon and label key', () => {
    const routes = [
      route(
        '/admin',
        { key: 'admin', permissions: [PERMISSIONS.usersManage] },
        {
          order: 20,
          iconName: 'shield',
          labelKey: 'nav.admin',
        },
      ),
    ];

    expect(selectVisibleNavItems(routes, adminContext)).toEqual([
      { path: '/admin', key: 'admin', order: 20, iconName: 'shield', labelKey: 'nav.admin' },
    ]);
  });
});
