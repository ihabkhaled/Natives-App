import { renderHook } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { useEffectivePermissions, useSession } from '@/modules/auth';
import { FEATURE_FLAGS } from '@/shared/config';
import { PERMISSIONS } from '@/shared/security';
import { ROUTE_ACCESS, type AppRouteDefinition, type RouteMeta } from '@/shared/types';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { useRouteGuard } from './use-route-guard.hook';

vi.mock('@/modules/auth', () => ({
  useSession: vi.fn(),
  useEffectivePermissions: vi.fn(),
}));

function DummyScreen(): React.JSX.Element {
  return <div>screen</div>;
}

function meta(overrides: Partial<RouteMeta> = {}): RouteMeta {
  return {
    key: 'route',
    titleKey: 'home.title',
    permissions: [],
    requiresTeamContext: false,
    offline: false,
    preload: false,
    featureFlag: null,
    nav: null,
    ...overrides,
  };
}

function definition(overrides: Partial<AppRouteDefinition> = {}): AppRouteDefinition {
  return {
    path: '/home',
    exact: true,
    access: ROUTE_ACCESS.Protected,
    component: DummyScreen,
    meta: meta(),
    ...overrides,
  };
}

function mockSession(options: { isAuthenticated: boolean; isResolved: boolean }): void {
  vi.mocked(useSession).mockReturnValue({
    status: options.isAuthenticated ? 'authenticated' : 'anonymous',
    isAuthenticated: options.isAuthenticated,
    isResolved: options.isResolved,
  });
}

function mockEffective(overrides: Partial<ReturnType<typeof useEffectivePermissions>> = {}): void {
  vi.mocked(useEffectivePermissions).mockReturnValue({
    permissions: [],
    accountActive: true,
    onboardingComplete: true,
    hasTeamContext: true,
    isLoading: false,
    isError: false,
    ...overrides,
  });
}

function guardOf(def: AppRouteDefinition): ReturnType<typeof useRouteGuard> {
  return renderHook(() => useRouteGuard(def)).result.current;
}

beforeAll(async () => {
  await initTestI18n();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useRouteGuard', () => {
  it('holds with a loading instruction until the session resolves', () => {
    mockSession({ isAuthenticated: false, isResolved: false });
    mockEffective();

    expect(guardOf(definition()).kind).toBe('loading');
  });

  it('redirects an authenticated user away from a public-only route with no metadata', () => {
    mockSession({ isAuthenticated: true, isResolved: true });
    mockEffective();

    const publicOnly: AppRouteDefinition = {
      path: '/login',
      exact: true,
      access: ROUTE_ACCESS.PublicOnly,
      component: DummyScreen,
    };
    const instruction = guardOf(publicOnly);

    expect(instruction).toEqual({ kind: 'redirect', to: '/home' });
  });

  it('renders the screen for an authorized, fully-onboarded session', () => {
    mockSession({ isAuthenticated: true, isResolved: true });
    mockEffective({ permissions: [PERMISSIONS.usersManage] });

    const instruction = guardOf(
      definition({ meta: meta({ permissions: [PERMISSIONS.usersManage] }) }),
    );

    expect(instruction).toEqual({ kind: 'screen', Screen: DummyScreen });
  });

  it('waits for the profile before deciding an authenticated protected route', () => {
    mockSession({ isAuthenticated: true, isResolved: true });
    mockEffective({ isLoading: true });

    expect(guardOf(definition()).kind).toBe('loading');
  });

  it('shows the forbidden state when a required permission is missing', () => {
    mockSession({ isAuthenticated: true, isResolved: true });
    mockEffective({ permissions: [PERMISSIONS.membersRead] });

    const instruction = guardOf(
      definition({
        meta: meta({
          permissions: [PERMISSIONS.usersManage],
          featureFlag: FEATURE_FLAGS.adminConsole,
        }),
      }),
    );

    expect(instruction).toMatchObject({ kind: 'state', title: 'You do not have access' });
  });

  it('blocks an inactive account with the account state', () => {
    mockSession({ isAuthenticated: true, isResolved: true });
    mockEffective({ accountActive: false });

    const instruction = guardOf(definition());

    expect(instruction).toMatchObject({ kind: 'state', title: 'Account unavailable' });
  });

  it('requires a team context when the route demands one', () => {
    mockSession({ isAuthenticated: true, isResolved: true });
    mockEffective({ hasTeamContext: false });

    const instruction = guardOf(definition({ meta: meta({ requiresTeamContext: true }) }));

    expect(instruction).toMatchObject({ kind: 'state', title: 'Select a team' });
  });
});
