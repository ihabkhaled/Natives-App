import { describe, expect, it } from 'vitest';

import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { findActiveRoute } from './active-route.helper';

function DummyScreen(): React.JSX.Element {
  return <div>screen</div>;
}

const routes: readonly AppRouteDefinition[] = [
  { path: '/home', exact: true, access: ROUTE_ACCESS.Protected, component: DummyScreen },
  { path: '/settings', exact: true, access: ROUTE_ACCESS.Public, component: DummyScreen },
];

describe('findActiveRoute', () => {
  it('returns the route whose path matches the current location', () => {
    expect(findActiveRoute(routes, '/settings')?.path).toBe('/settings');
  });

  it('returns null when no route matches', () => {
    expect(findActiveRoute(routes, '/unknown')).toBeNull();
  });
});
