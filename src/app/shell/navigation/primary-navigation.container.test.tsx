import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { APP_ICONS } from '@/packages/icons';
import { TEST_IDS } from '@/shared/config';
import { NAV_GROUP } from '@/shared/types';

import type { PrimaryNavigationView } from './navigation.types';
import { PrimaryNavigationContainer } from './primary-navigation.container';
import { usePrimaryNavigation } from './use-primary-navigation.hook';

vi.mock('./use-primary-navigation.hook', () => ({ usePrimaryNavigation: vi.fn() }));

function mockView(view: Partial<PrimaryNavigationView>): void {
  vi.mocked(usePrimaryNavigation).mockReturnValue({
    isVisible: false,
    ariaLabel: 'Primary',
    appName: 'Ultimate Natives',
    tagline: 'Elite ultimate. One community.',
    logoLabel: 'Ultimate Natives logo',
    profile: null,
    groups: [],
    ...view,
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('PrimaryNavigationContainer', () => {
  it('renders nothing while navigation is not visible', () => {
    mockView({ isVisible: false });

    render(<PrimaryNavigationContainer />);

    expect(screen.queryByTestId(TEST_IDS.primaryNav)).not.toBeInTheDocument();
  });

  it('renders the navigation bar once it is visible', () => {
    mockView({
      isVisible: true,
      groups: [
        {
          key: NAV_GROUP.Overview,
          label: 'Overview',
          items: [
            {
              key: 'home',
              label: 'Home',
              icon: APP_ICONS.home,
              testId: `${TEST_IDS.primaryNavItem}-home`,
              isActive: true,
              onSelect: vi.fn(),
            },
          ],
        },
      ],
    });

    render(<PrimaryNavigationContainer />);

    expect(screen.getByTestId(TEST_IDS.primaryNav)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });
});
