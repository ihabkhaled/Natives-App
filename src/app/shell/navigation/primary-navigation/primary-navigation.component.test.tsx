import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { APP_ICONS } from '@/packages/icons';
import { TEST_IDS } from '@/shared/config';

import type { PrimaryNavItem } from '../navigation.types';
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

describe('PrimaryNavigation', () => {
  it('renders a labelled navigation region with one button per item', () => {
    render(
      <PrimaryNavigation
        isVisible
        ariaLabel="Primary"
        appName="Ultimate Natives"
        logoLabel="Ultimate Natives logo"
        profile={null}
        items={[
          item(),
          item({ key: 'settings', label: 'Settings', testId: 'primary-nav-item-settings' }),
        ]}
      />,
    );

    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(nav).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByTestId(TEST_IDS.primaryNav)).toBeInTheDocument();
  });

  it('marks the active item with aria-current and leaves the others unset', () => {
    render(
      <PrimaryNavigation
        isVisible
        ariaLabel="Primary"
        appName="Ultimate Natives"
        logoLabel="Ultimate Natives logo"
        profile={null}
        items={[
          item({ isActive: true }),
          item({ key: 'settings', label: 'Settings', testId: 'primary-nav-item-settings' }),
        ]}
      />,
    );

    expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Settings' })).not.toHaveAttribute('aria-current');
  });

  it('invokes the item handler on activation', async () => {
    const onSelect = vi.fn();
    render(
      <PrimaryNavigation
        isVisible
        ariaLabel="Primary"
        appName="Ultimate Natives"
        logoLabel="Ultimate Natives logo"
        profile={null}
        items={[item({ onSelect })]}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Home' }));

    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('renders no navigation landmark before the session is ready', () => {
    render(
      <PrimaryNavigation
        isVisible={false}
        ariaLabel="Primary"
        appName="Ultimate Natives"
        logoLabel="Ultimate Natives logo"
        profile={null}
        items={[]}
      />,
    );

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders the signed-in profile block when a profile is provided', () => {
    render(
      <PrimaryNavigation
        isVisible
        ariaLabel="Primary"
        appName="Ultimate Natives"
        logoLabel="Ultimate Natives logo"
        profile={{ name: 'Ranger Rick', label: 'Your profile' }}
        items={[item()]}
      />,
    );

    expect(screen.getByText('Ranger Rick')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Your profile' })).toBeInTheDocument();
  });
});
