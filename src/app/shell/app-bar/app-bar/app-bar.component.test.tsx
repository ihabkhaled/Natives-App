import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { APP_ICONS } from '@/packages/icons';
import { TEST_IDS } from '@/shared/config';

import type { AppBarView } from '../app-bar.types';
import { AppBar } from './app-bar.component';

function view(overrides: Partial<AppBarView> = {}): AppBarView {
  return {
    isVisible: true,
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
    notificationsEmptyMessage: 'New practice and roster updates will land here.',
    userName: 'Ranger Rick',
    avatarLabel: 'Your profile',
    userMenuLabel: 'Account menu',
    isUserMenuOpen: false,
    onToggleUserMenu: vi.fn(),
    userMenuItems: [
      {
        key: 'settings',
        label: 'Settings',
        icon: APP_ICONS.settings,
        testId: TEST_IDS.appBarSettings,
        onSelect: vi.fn(),
      },
    ],
    ...overrides,
  };
}

describe('AppBar', () => {
  it('renders nothing until the session resolves', () => {
    render(<AppBar {...view({ isVisible: false })} />);

    expect(screen.queryByTestId(TEST_IDS.appBar)).not.toBeInTheDocument();
  });

  it('shows the routed page title above its product context', () => {
    render(<AppBar {...view()} />);

    expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeInTheDocument();
    expect(screen.getByText('Ultimate Natives')).toBeInTheDocument();
  });

  it('exposes the palette switch as a labelled toggle', async () => {
    const onToggleTheme = vi.fn();
    render(<AppBar {...view({ onToggleTheme })} />);

    const toggle = screen.getByTestId(TEST_IDS.appBarThemeToggle);
    expect(toggle).toHaveAttribute('aria-label', 'Switch to dark theme');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    expect(onToggleTheme).toHaveBeenCalledOnce();
  });

  it('marks the palette switch pressed on the dark theme', () => {
    render(<AppBar {...view({ isDark: true, themeToggleLabel: 'Switch to light theme' })} />);

    expect(screen.getByTestId(TEST_IDS.appBarThemeToggle)).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps the notifications panel closed until the affordance is used', async () => {
    const onToggleNotifications = vi.fn();
    render(<AppBar {...view({ onToggleNotifications })} />);

    expect(screen.queryByTestId(TEST_IDS.appBarNotificationsPanel)).not.toBeInTheDocument();
    await userEvent.click(screen.getByTestId(TEST_IDS.appBarNotifications));
    expect(onToggleNotifications).toHaveBeenCalledOnce();
  });

  it('renders a designed empty state inside the open notifications panel', () => {
    render(<AppBar {...view({ isNotificationsOpen: true })} />);

    const panel = screen.getByTestId(TEST_IDS.appBarNotificationsPanel);
    expect(panel).toHaveTextContent('You are all caught up');
    expect(panel).toHaveTextContent('New practice and roster updates will land here.');
    expect(screen.getByTestId(TEST_IDS.appBarNotifications)).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('opens the account menu from the avatar button', async () => {
    const onToggleUserMenu = vi.fn();
    render(<AppBar {...view({ onToggleUserMenu })} />);

    const button = screen.getByTestId(TEST_IDS.appBarUserMenuButton);
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(screen.getByRole('img', { name: 'Your profile' })).toBeInTheDocument();
    await userEvent.click(button);
    expect(onToggleUserMenu).toHaveBeenCalledOnce();
  });

  it('lists the account menu entries as menu items', async () => {
    const onSelect = vi.fn();
    render(
      <AppBar
        {...view({
          isUserMenuOpen: true,
          userMenuItems: [
            {
              key: 'settings',
              label: 'Settings',
              icon: APP_ICONS.settings,
              testId: TEST_IDS.appBarSettings,
              onSelect,
            },
            {
              key: 'sign-out',
              label: 'Sign out',
              icon: APP_ICONS.logOut,
              testId: TEST_IDS.appBarSignOut,
              onSelect: vi.fn(),
            },
          ],
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.appBarUserMenu)).toHaveAttribute('role', 'menu');
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);
    await userEvent.click(screen.getByTestId(TEST_IDS.appBarSettings));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
