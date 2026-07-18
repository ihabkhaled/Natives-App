import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { renderWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { HOME_VIEW_TEST_IDS } from '../components/home-view/home-view.constants';
import { useHomeScreen, type HomeScreenView } from '../hooks/use-home-screen.hook';
import { HomeContainer } from './home.container';

vi.mock('../hooks/use-home-screen.hook', () => ({ useHomeScreen: vi.fn() }));
vi.mock('@/modules/health', () => ({
  HealthCardContainer: () => <div data-testid="health-card">Health card</div>,
}));

const onLogout = vi.fn();

function mockScreen(overrides: Partial<HomeScreenView> = {}): void {
  vi.mocked(useHomeScreen).mockReturnValue({
    title: 'Home',
    greeting: 'Hello, Ranger Rick',
    isLoadingUser: false,
    loadingLabel: 'Loading…',
    logoutLabel: 'Sign out',
    manageSessionsLabel: 'Manage your devices',
    isLoggingOut: false,
    onLogout,
    ...overrides,
  });
}

beforeEach(() => {
  mockScreen();
});

afterEach(() => {
  vi.clearAllMocks();
});

function getIonTitle(): Element | null {
  return document.body.querySelector('ion-title');
}

describe('HomeContainer', () => {
  it('renders the home page shell titled from the screen hook', () => {
    renderWithProviders(<HomeContainer />);

    expect(screen.getByTestId(TEST_IDS.homePage)).toBeInTheDocument();
    expect(getIonTitle()).toHaveTextContent('Home');
  });

  it('shows the greeting supplied by the screen hook', () => {
    renderWithProviders(<HomeContainer />);

    expect(screen.getByTestId(HOME_VIEW_TEST_IDS.greeting)).toHaveTextContent('Hello, Ranger Rick');
  });

  it('fills the health slot with the health module container', () => {
    renderWithProviders(<HomeContainer />);

    expect(screen.getByTestId(TEST_IDS.healthCard)).toBeInTheDocument();
  });

  it('shows the loading state while the profile loads', () => {
    mockScreen({ isLoadingUser: true });

    renderWithProviders(<HomeContainer />);

    expect(screen.getByTestId(TEST_IDS.loadingState)).toHaveTextContent('Loading…');
    expect(screen.queryByTestId(HOME_VIEW_TEST_IDS.greeting)).not.toBeInTheDocument();
  });

  it('wires sign-out back to the screen hook', async () => {
    renderWithProviders(<HomeContainer />);

    await userEvent.click(screen.getByTestId(HOME_VIEW_TEST_IDS.logout));

    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('reflects an in-flight sign-out', () => {
    mockScreen({ isLoggingOut: true });

    renderWithProviders(<HomeContainer />);

    expect(screen.getByTestId(HOME_VIEW_TEST_IDS.logout)).toHaveAttribute('aria-busy', 'true');
  });

  it('offers a link to manage device sessions', async () => {
    renderWithProviders(<HomeContainer />);

    const link = screen.getByTestId(TEST_IDS.homeSessionsLink);
    expect(link).toHaveTextContent('Manage your devices');
    await userEvent.click(link);
  });
});
