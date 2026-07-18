import { screen } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ICONS } from '@/packages/icons';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { ROUTE_ACCESS, type AppRouteDefinition } from '@/shared/types';

import { renderWithProviders } from '../../../tests/setup/render-with-providers.helper';
import { GuardedRoute } from './guarded-route.guard';
import type { GuardInstruction } from './guarded-route.types';
import { useRouteGuard } from './hooks/use-route-guard.hook';

vi.mock('./hooks/use-route-guard.hook', () => ({ useRouteGuard: vi.fn() }));

const LOCATION_TEST_ID = 'current-location';
const SCREEN_TEST_ID = 'screen-content';

function ScreenComponent(): React.JSX.Element {
  return <div data-testid={SCREEN_TEST_ID}>screen</div>;
}

function LocationProbe(): React.JSX.Element {
  const location = useLocation();
  return <div data-testid={LOCATION_TEST_ID}>{location.pathname}</div>;
}

const DEFINITION: AppRouteDefinition = {
  path: '/guarded',
  exact: true,
  access: ROUTE_ACCESS.Protected,
  component: ScreenComponent,
};

function renderGuard(instruction: GuardInstruction): void {
  vi.mocked(useRouteGuard).mockReturnValue(instruction);
  renderWithProviders(
    <>
      <GuardedRoute definition={DEFINITION} />
      <LocationProbe />
    </>,
    { initialPath: '/guarded' },
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('GuardedRoute', () => {
  it('renders the global loading state while the guard is undecided', () => {
    renderGuard({ kind: 'loading', label: 'Loading…' });

    expect(screen.getByTestId(TEST_IDS.globalLoading)).toHaveTextContent('Loading…');
    expect(screen.queryByTestId(SCREEN_TEST_ID)).not.toBeInTheDocument();
  });

  it('redirects without ever rendering the guarded screen', () => {
    renderGuard({ kind: 'redirect', to: APP_PATHS.login });

    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(APP_PATHS.login);
    expect(screen.queryByTestId(SCREEN_TEST_ID)).not.toBeInTheDocument();
  });

  it('renders a blocking state instead of the screen', () => {
    renderGuard({
      kind: 'state',
      icon: APP_ICONS.lock,
      tone: 'warning',
      title: 'You do not have access',
      message: 'This area needs a permission you lack.',
      testId: TEST_IDS.guardForbidden,
    });

    expect(screen.getByTestId(TEST_IDS.guardForbidden)).toHaveTextContent('You do not have access');
    expect(screen.queryByTestId(SCREEN_TEST_ID)).not.toBeInTheDocument();
  });

  it('renders the screen once access is allowed', () => {
    renderGuard({ kind: 'screen', Screen: ScreenComponent });

    expect(screen.getByTestId(SCREEN_TEST_ID)).toBeInTheDocument();
  });
});
