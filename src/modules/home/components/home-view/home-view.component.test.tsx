import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { HomeView } from './home-view.component';
import { HOME_VIEW_TEST_IDS } from './home-view.constants';
import type { HomeViewProps } from './home-view.types';

function buildProps(overrides: Partial<HomeViewProps> = {}): HomeViewProps {
  return {
    title: 'Home',
    greeting: 'Hello, Ranger Rick',
    userName: 'Ranger Rick',
    avatarLabel: 'Your profile',
    isLoadingUser: false,
    loadingLabel: 'Loading…',
    manageSessionsLabel: 'Manage your devices',
    practiceCalendarLabel: 'Open the practice calendar',
    onManageSessions: vi.fn(),
    onOpenPracticeCalendar: vi.fn(),
    dashboardSlot: <div data-testid={TEST_IDS.dashboardView}>Dashboard</div>,
    healthSlot: <div data-testid={TEST_IDS.healthCard}>Health</div>,
    ...overrides,
  };
}

function mountHome(props: HomeViewProps = buildProps()): void {
  render(<HomeView {...props} />);
}

describe('HomeView', () => {
  it('greets the signed-in user once the profile has loaded', () => {
    mountHome();

    expect(screen.getByTestId(HOME_VIEW_TEST_IDS.greeting)).toHaveTextContent('Hello, Ranger Rick');
    expect(screen.queryByTestId(TEST_IDS.loadingState)).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Your profile' })).toBeInTheDocument();
  });

  it('renders the fallback avatar when the display name is not yet known', () => {
    mountHome(buildProps({ userName: null }));

    expect(screen.getByRole('img', { name: 'Your profile' })).toBeInTheDocument();
    expect(screen.getByTestId(HOME_VIEW_TEST_IDS.greeting)).toBeInTheDocument();
  });

  it('shows the loading state instead of the greeting while the profile loads', () => {
    mountHome(buildProps({ isLoadingUser: true }));

    expect(screen.getByTestId(TEST_IDS.loadingState)).toHaveTextContent('Loading…');
    expect(screen.queryByTestId(HOME_VIEW_TEST_IDS.greeting)).not.toBeInTheDocument();
  });

  it('renders whatever the health slot contains', () => {
    mountHome();

    expect(screen.getByTestId(TEST_IDS.healthCard)).toBeInTheDocument();
  });

  it('renders whatever the dashboard slot contains', () => {
    mountHome();

    expect(screen.getByTestId(TEST_IDS.dashboardView)).toBeInTheDocument();
  });

  it('keeps the dashboard slot mounted while the profile loads', () => {
    mountHome(buildProps({ isLoadingUser: true }));

    expect(screen.getByTestId(TEST_IDS.dashboardView)).toBeInTheDocument();
  });

  it('keeps the health slot mounted while the profile loads', () => {
    mountHome(buildProps({ isLoadingUser: true }));

    expect(screen.getByTestId(TEST_IDS.healthCard)).toBeInTheDocument();
  });

  it('never renders a sign-out control on the home canvas', () => {
    mountHome();

    expect(screen.queryByTestId(TEST_IDS.homeLogoutButton)).not.toBeInTheDocument();
  });

  it('lays the canvas out as one main region holding both slots', () => {
    mountHome();

    const main = screen.getByRole('main');
    expect(main).toHaveClass('app-home-layout');
    expect(screen.getByTestId(TEST_IDS.dashboardView)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.healthCard)).toBeInTheDocument();
  });

  it('opens the practice calendar from the hero action', async () => {
    const props = buildProps();
    mountHome(props);

    await userEvent.click(screen.getByTestId(HOME_VIEW_TEST_IDS.practice));

    expect(props.onOpenPracticeCalendar).toHaveBeenCalledOnce();
  });

  it('opens device management from the hero action', async () => {
    const props = buildProps();
    mountHome(props);

    await userEvent.click(screen.getByTestId(HOME_VIEW_TEST_IDS.sessions));

    expect(props.onManageSessions).toHaveBeenCalledOnce();
  });

  it('keeps both hero actions reachable side by side', () => {
    mountHome();

    expect(screen.getByTestId(HOME_VIEW_TEST_IDS.practice)).toBeInTheDocument();
    expect(screen.getByTestId(HOME_VIEW_TEST_IDS.sessions)).toBeInTheDocument();
  });
});
