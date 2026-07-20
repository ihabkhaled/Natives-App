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
vi.mock('@/modules/dashboard', () => ({
  DashboardContainer: () => <div data-testid="dashboard-view">Dashboard</div>,
}));
vi.mock('@/modules/practice', () => ({ practicesPath: () => '/practices' }));

const onManageSessions = vi.fn();
const onOpenPracticeCalendar = vi.fn();

function mockScreen(overrides: Partial<HomeScreenView> = {}): void {
  vi.mocked(useHomeScreen).mockReturnValue({
    title: 'Home',
    greeting: 'Hello, Ranger Rick',
    userName: 'Ranger Rick',
    avatarLabel: 'Your profile',
    isLoadingUser: false,
    loadingLabel: 'Loading…',
    manageSessionsLabel: 'Manage your devices',
    practiceCalendarLabel: 'Open the practice calendar',
    onManageSessions,
    onOpenPracticeCalendar,
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

  it('fills the dashboard slot with the dashboard module container', () => {
    renderWithProviders(<HomeContainer />);

    expect(screen.getByTestId(TEST_IDS.dashboardView)).toBeInTheDocument();
  });

  it('shows the loading state while the profile loads', () => {
    mockScreen({ isLoadingUser: true });

    renderWithProviders(<HomeContainer />);

    expect(screen.getByTestId(TEST_IDS.loadingState)).toHaveTextContent('Loading…');
    expect(screen.queryByTestId(HOME_VIEW_TEST_IDS.greeting)).not.toBeInTheDocument();
  });

  it('never renders a floating sign-out on the home canvas', () => {
    renderWithProviders(<HomeContainer />);

    expect(screen.queryByTestId(TEST_IDS.homeLogoutButton)).not.toBeInTheDocument();
  });

  it('keeps the home canvas to hero, dashboard, and health only', () => {
    renderWithProviders(<HomeContainer />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.dashboardView)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.healthCard)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.homeLogoutButton)).not.toBeInTheDocument();
  });

  it('offers a link to manage device sessions', async () => {
    renderWithProviders(<HomeContainer />);

    const link = screen.getByTestId(TEST_IDS.homeSessionsLink);
    expect(link).toHaveTextContent('Manage your devices');
    await userEvent.click(link);
    expect(onManageSessions).toHaveBeenCalledOnce();
  });

  it('offers a link to the practice calendar', async () => {
    renderWithProviders(<HomeContainer />);

    const link = screen.getByTestId(TEST_IDS.homePracticeLink);
    expect(link).toHaveTextContent('Open the practice calendar');
    await userEvent.click(link);
    expect(onOpenPracticeCalendar).toHaveBeenCalledOnce();
  });
});
