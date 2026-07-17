import { screen } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { ROUTE_ACCESS, type AppRouteDefinition, type RouteAccess } from '@/shared/types';

import { renderWithProviders } from '../../../tests/setup/render-with-providers.helper';
import { GuardedRoute } from './guarded-route.guard';
import { useRouteGuard } from './hooks/use-route-guard.hook';

vi.mock('./hooks/use-route-guard.hook', () => ({ useRouteGuard: vi.fn() }));

const SCREEN_TEST_ID = 'guarded-screen';
const LOCATION_TEST_ID = 'current-location';

function GuardedScreen(): React.JSX.Element {
  return <div data-testid={SCREEN_TEST_ID}>Screen</div>;
}

function LocationProbe(): React.JSX.Element {
  const location = useLocation();
  return <div data-testid={LOCATION_TEST_ID}>{location.pathname}</div>;
}

function buildDefinition(access: RouteAccess): AppRouteDefinition {
  return { path: '/guarded', exact: true, access, component: GuardedScreen };
}

function mockGuard(options: { readonly isResolved: boolean; readonly isAuthenticated: boolean }) {
  vi.mocked(useRouteGuard).mockReturnValue({ ...options, loadingLabel: 'Loading…' });
}

function renderGuard(access: RouteAccess): void {
  renderWithProviders(
    <>
      <GuardedRoute definition={buildDefinition(access)} />
      <LocationProbe />
    </>,
    { initialPath: '/guarded' },
  );
}

function currentPath(): string | null {
  return screen.getByTestId(LOCATION_TEST_ID).textContent;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('GuardedRoute', () => {
  describe('while the session is still unknown', () => {
    it('shows the global loading state instead of the screen', () => {
      mockGuard({ isResolved: false, isAuthenticated: false });

      renderGuard(ROUTE_ACCESS.Protected);

      expect(screen.getByTestId(TEST_IDS.globalLoading)).toHaveTextContent('Loading…');
      expect(screen.queryByTestId(SCREEN_TEST_ID)).not.toBeInTheDocument();
    });

    it('never redirects before it knows who the user is', () => {
      mockGuard({ isResolved: false, isAuthenticated: false });

      renderGuard(ROUTE_ACCESS.Protected);

      expect(currentPath()).toBe('/guarded');
    });

    it('holds even a public route until the session resolves', () => {
      mockGuard({ isResolved: false, isAuthenticated: false });

      renderGuard(ROUTE_ACCESS.Public);

      expect(screen.getByTestId(TEST_IDS.globalLoading)).toBeInTheDocument();
    });
  });

  describe('a protected route', () => {
    it('sends an anonymous visitor to the login screen', () => {
      mockGuard({ isResolved: true, isAuthenticated: false });

      renderGuard(ROUTE_ACCESS.Protected);

      expect(currentPath()).toBe(APP_PATHS.login);
      expect(screen.queryByTestId(SCREEN_TEST_ID)).not.toBeInTheDocument();
    });

    it('renders the screen for an authenticated user', () => {
      mockGuard({ isResolved: true, isAuthenticated: true });

      renderGuard(ROUTE_ACCESS.Protected);

      expect(screen.getByTestId(SCREEN_TEST_ID)).toBeInTheDocument();
      expect(currentPath()).toBe('/guarded');
    });
  });

  describe('a public-only route', () => {
    it('sends an authenticated user to the home screen', () => {
      mockGuard({ isResolved: true, isAuthenticated: true });

      renderGuard(ROUTE_ACCESS.PublicOnly);

      expect(currentPath()).toBe(APP_PATHS.home);
      expect(screen.queryByTestId(SCREEN_TEST_ID)).not.toBeInTheDocument();
    });

    it('renders the screen for an anonymous visitor', () => {
      mockGuard({ isResolved: true, isAuthenticated: false });

      renderGuard(ROUTE_ACCESS.PublicOnly);

      expect(screen.getByTestId(SCREEN_TEST_ID)).toBeInTheDocument();
    });
  });

  describe('a public route', () => {
    it('renders the screen for an anonymous visitor', () => {
      mockGuard({ isResolved: true, isAuthenticated: false });

      renderGuard(ROUTE_ACCESS.Public);

      expect(screen.getByTestId(SCREEN_TEST_ID)).toBeInTheDocument();
      expect(currentPath()).toBe('/guarded');
    });

    it('renders the screen for an authenticated user', () => {
      mockGuard({ isResolved: true, isAuthenticated: true });

      renderGuard(ROUTE_ACCESS.Public);

      expect(screen.getByTestId(SCREEN_TEST_ID)).toBeInTheDocument();
      expect(currentPath()).toBe('/guarded');
    });
  });
});
