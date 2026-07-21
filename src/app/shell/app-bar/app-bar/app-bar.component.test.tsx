import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { APP_ICONS } from '@/packages/icons';
import { TEST_IDS } from '@/shared/config';

import { buildAppBarView } from '../../../../../tests/factories/app-bar-view.factory';

import type { AppBarView } from '../app-bar.types';
import { AppBar } from './app-bar.component';

function view(overrides: Partial<AppBarView> = {}): AppBarView {
  return buildAppBarView(overrides);
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

describe('AppBar notifications affordance', () => {
  it('shows no badge while the inbox is clear', () => {
    render(<AppBar {...view()} />);

    expect(screen.queryByTestId(TEST_IDS.appBarNotificationsBadge)).not.toBeInTheDocument();
  });

  it('badges the icon button with the unread count', () => {
    render(
      <AppBar {...view({ notificationsBadgeLabel: '3 unread', notificationsUnreadCount: 3 })} />,
    );

    expect(screen.getByTestId(TEST_IDS.appBarNotificationsBadge)).toHaveTextContent('3');
  });

  it('shows the loading label while the inbox is still resolving', () => {
    render(<AppBar {...view({ isNotificationsOpen: true, isNotificationsLoading: true })} />);

    expect(screen.getByTestId(TEST_IDS.appBarNotificationsPanel)).toHaveTextContent(
      'Loading notifications',
    );
  });

  it('shows the designed empty copy when nothing has arrived', () => {
    render(<AppBar {...view({ isNotificationsOpen: true })} />);

    expect(screen.getByTestId(TEST_IDS.appBarNotificationsPanel)).toHaveTextContent(
      'You are all caught up',
    );
  });

  it('previews each entry and opens it through the arrival screen', async () => {
    const onOpenNotification = vi.fn();
    render(
      <AppBar
        {...view({
          isNotificationsOpen: true,
          onOpenNotification,
          notificationsLatest: [
            {
              id: 'ntf-1',
              title: 'Practice published',
              receivedLabel: 'Received: today',
              isUnread: true,
            },
          ],
        })}
      />,
    );

    await userEvent.click(screen.getByTestId(TEST_IDS.appBarNotificationItem));

    expect(onOpenNotification).toHaveBeenCalledWith('ntf-1');
  });

  it('offers both routes out of the popover', async () => {
    const onViewAllNotifications = vi.fn();
    const onOpenNotificationPreferences = vi.fn();
    render(
      <AppBar
        {...view({
          isNotificationsOpen: true,
          onViewAllNotifications,
          onOpenNotificationPreferences,
        })}
      />,
    );

    await userEvent.click(screen.getByTestId(TEST_IDS.appBarNotificationsViewAll));
    await userEvent.click(screen.getByTestId(TEST_IDS.appBarNotificationsPreferences));

    expect(onViewAllNotifications).toHaveBeenCalledOnce();
    expect(onOpenNotificationPreferences).toHaveBeenCalledOnce();
  });
});
