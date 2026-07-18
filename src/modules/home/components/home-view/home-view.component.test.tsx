import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { HomeView } from './home-view.component';
import { HOME_VIEW_TEST_IDS } from './home-view.constants';
import type { HomeViewProps } from './home-view.types';

function buildProps(overrides: Partial<HomeViewProps> = {}): HomeViewProps {
  return {
    greeting: 'Hello, Ranger Rick',
    isLoadingUser: false,
    loadingLabel: 'Loading…',
    logoutLabel: 'Sign out',
    isLoggingOut: false,
    onLogout: vi.fn(),
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

  it('renders the sign-out button under its test id', () => {
    mountHome();

    expect(screen.getByTestId(HOME_VIEW_TEST_IDS.logout)).toHaveTextContent('Sign out');
  });

  it('forwards a sign-out click', async () => {
    const props = buildProps();
    mountHome(props);

    await userEvent.click(screen.getByTestId(HOME_VIEW_TEST_IDS.logout));

    expect(props.onLogout).toHaveBeenCalledOnce();
  });

  it('blocks a second sign-out while one is in flight', () => {
    mountHome(buildProps({ isLoggingOut: true }));

    const button = screen.getByTestId(HOME_VIEW_TEST_IDS.logout);
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveProperty('disabled', true);
  });
});
