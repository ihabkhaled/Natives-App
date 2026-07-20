import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { AppBarContainer } from './app-bar.container';
import type { AppBarView } from './app-bar.types';
import { useAppBar } from './use-app-bar.hook';

vi.mock('./use-app-bar.hook', () => ({ useAppBar: vi.fn() }));

function mockView(overrides: Partial<AppBarView>): void {
  vi.mocked(useAppBar).mockReturnValue({
    isVisible: false,
    ariaLabel: 'Page actions',
    title: 'Home',
    context: 'Ultimate Natives',
    themeToggleLabel: 'Switch to dark theme',
    isDark: false,
    onToggleTheme: vi.fn(),
    notificationsLabel: 'Notifications',
    isNotificationsOpen: false,
    onToggleNotifications: vi.fn(),
    notificationsEmptyTitle: 'You are all caught up',
    notificationsEmptyMessage: 'Updates land here.',
    userName: 'Ranger Rick',
    avatarLabel: 'Your profile',
    userMenuLabel: 'Account menu',
    isUserMenuOpen: false,
    onToggleUserMenu: vi.fn(),
    userMenuItems: [],
    ...overrides,
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('AppBarContainer', () => {
  it('renders nothing while the app bar is not visible', () => {
    mockView({ isVisible: false });

    render(<AppBarContainer />);

    expect(screen.queryByTestId(TEST_IDS.appBar)).not.toBeInTheDocument();
  });

  it('renders the bar with the routed title once it is visible', () => {
    mockView({ isVisible: true, title: 'Practice calendar' });

    render(<AppBarContainer />);

    expect(screen.getByTestId(TEST_IDS.appBar)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Practice calendar');
  });
});
