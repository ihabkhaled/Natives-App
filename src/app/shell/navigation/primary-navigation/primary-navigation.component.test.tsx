import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { APP_ICONS } from '@/packages/icons';
import { TEST_IDS } from '@/shared/config';
import { NAV_GROUP } from '@/shared/types';

import type { PrimaryNavGroup, PrimaryNavItem, PrimaryNavigationView } from '../navigation.types';
import { PrimaryNavigation } from './primary-navigation.component';

function item(overrides: Partial<PrimaryNavItem> = {}): PrimaryNavItem {
  return {
    key: 'home',
    label: 'Home',
    icon: APP_ICONS.home,
    testId: `${TEST_IDS.primaryNavItem}-home`,
    isActive: false,
    onSelect: vi.fn(),
    ...overrides,
  };
}

function group(
  items: readonly PrimaryNavItem[],
  overrides: Partial<PrimaryNavGroup> = {},
): PrimaryNavGroup {
  return { key: NAV_GROUP.Overview, label: 'Overview', items, ...overrides };
}

function view(overrides: Partial<PrimaryNavigationView> = {}): PrimaryNavigationView {
  return {
    isVisible: true,
    ariaLabel: 'Primary',
    appName: 'Ultimate Natives',
    tagline: 'Elite ultimate. One community.',
    logoLabel: 'Ultimate Natives logo',
    profile: null,
    groups: [group([item()])],
    ...overrides,
  };
}

const settingsItem = item({
  key: 'settings',
  label: 'Settings',
  testId: 'primary-nav-item-settings',
});

describe('PrimaryNavigation', () => {
  it('renders a labelled navigation region with one button per item', () => {
    render(
      <PrimaryNavigation
        {...view({
          groups: [
            group([item()]),
            group([settingsItem], { key: NAV_GROUP.Manage, label: 'Manage' }),
          ],
        })}
      />,
    );

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByTestId(TEST_IDS.primaryNav)).toBeInTheDocument();
  });

  it('labels every section so the sidebar reads as grouped destinations', () => {
    render(
      <PrimaryNavigation
        {...view({
          groups: [group([item()]), group([settingsItem], { key: NAV_GROUP.Team, label: 'Team' })],
        })}
      />,
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
  });

  it('caps the sidebar with the brand block', () => {
    render(<PrimaryNavigation {...view()} />);

    expect(screen.getByText('Ultimate Natives')).toBeInTheDocument();
    expect(screen.getByText('Elite ultimate. One community.')).toBeInTheDocument();
    expect(screen.getByAltText('Ultimate Natives logo')).toBeInTheDocument();
  });

  it('marks the active item with aria-current and leaves the others unset', () => {
    render(
      <PrimaryNavigation
        {...view({ groups: [group([item({ isActive: true }), settingsItem])] })}
      />,
    );

    expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Settings' })).not.toHaveAttribute('aria-current');
  });

  it('invokes the item handler on activation', async () => {
    const onSelect = vi.fn();
    render(<PrimaryNavigation {...view({ groups: [group([item({ onSelect })])] })} />);

    await userEvent.click(screen.getByRole('button', { name: 'Home' }));

    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('renders no navigation landmark before the session is ready', () => {
    render(<PrimaryNavigation {...view({ isVisible: false, groups: [] })} />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('pins the signed-in profile block with its own sign-out control', async () => {
    const onSignOut = vi.fn();
    render(
      <PrimaryNavigation
        {...view({
          profile: {
            name: 'Ranger Rick',
            label: 'Your profile',
            signOutLabel: 'Sign out',
            isSigningOut: false,
            onSignOut,
          },
        })}
      />,
    );

    expect(screen.getByText('Ranger Rick')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Your profile' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('reflects an in-flight sign-out on the pinned control', () => {
    render(
      <PrimaryNavigation
        {...view({
          profile: {
            name: 'Ranger Rick',
            label: 'Your profile',
            signOutLabel: 'Sign out',
            isSigningOut: true,
            onSignOut: vi.fn(),
          },
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.primaryNavSignOut)).toHaveAttribute('aria-busy', 'true');
  });
});
