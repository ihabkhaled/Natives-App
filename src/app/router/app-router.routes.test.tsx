import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { APP_PATHS } from '@/shared/config';
import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { AppRouter } from './app-router.routes';

const WELCOME_ROUTE: AppRouteDefinition = {
  path: APP_PATHS.welcome,
  exact: true,
  access: ROUTE_ACCESS.Public,
  component: () => <div>welcome screen</div>,
};

const HOME_ROUTE: AppRouteDefinition = {
  path: APP_PATHS.home,
  exact: true,
  access: ROUTE_ACCESS.Protected,
  component: () => <div>home screen</div>,
};

const CATCH_ALL: AppRouteDefinition = {
  path: '*',
  exact: false,
  access: ROUTE_ACCESS.Public,
  component: () => <div>not found screen</div>,
};

vi.mock('./route-registry', () => ({
  getAppRouteDefinitions: () => [WELCOME_ROUTE, HOME_ROUTE],
  getCatchAllRouteDefinition: () => CATCH_ALL,
}));

// The guard has its own tests; here it only needs to name what it guarded.
vi.mock('./guarded-route.guard', () => ({
  GuardedRoute: (props: { readonly definition: AppRouteDefinition }) => (
    <div data-testid="guarded-route">{props.definition.path}</div>
  ),
}));

vi.mock('../lifecycle/app-lifecycle.provider', () => ({ AppLifecycle: () => null }));
vi.mock('./route-chrome.provider', () => ({ RouteChrome: () => null }));
vi.mock('../shell/navigation/primary-navigation.container', () => ({
  PrimaryNavigationContainer: () => null,
}));
vi.mock('../shell/app-bar/app-bar.container', () => ({ AppBarContainer: () => null }));

/** IonReactRouter owns its own browser history, so drive the real URL. */
function visit(path: string): void {
  window.history.pushState({}, '', path);
}

function queryRouterOutlet(): Element | null {
  return document.body.querySelector('ion-router-outlet');
}

beforeEach(() => {
  visit('/');
});

describe('AppRouter', () => {
  it('redirects the root path to the welcome screen', () => {
    render(<AppRouter />);

    expect(screen.getByTestId('guarded-route')).toHaveTextContent(APP_PATHS.welcome);
  });

  it('routes a registered path through the guard', () => {
    visit(APP_PATHS.home);

    render(<AppRouter />);

    expect(screen.getByTestId('guarded-route')).toHaveTextContent(APP_PATHS.home);
  });

  it('guards every route it renders, so no screen escapes the session policy', () => {
    visit(APP_PATHS.welcome);

    render(<AppRouter />);

    expect(screen.getAllByTestId('guarded-route')).toHaveLength(1);
  });

  it('falls through to the catch-all for an unknown path', () => {
    visit('/definitely-not-a-route');

    render(<AppRouter />);

    expect(screen.getByTestId('guarded-route')).toHaveTextContent('*');
  });

  it('mounts the router outlet that owns page transitions', () => {
    render(<AppRouter />);

    expect(queryRouterOutlet()).toBeInTheDocument();
  });
});
