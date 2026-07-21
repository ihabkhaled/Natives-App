import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildAppBarView } from '../../../../tests/factories/app-bar-view.factory';

import { AppBarContainer } from './app-bar.container';
import type { AppBarView } from './app-bar.types';
import { useAppBar } from './use-app-bar.hook';

vi.mock('./use-app-bar.hook', () => ({ useAppBar: vi.fn() }));

function mockView(overrides: Partial<AppBarView>): void {
  vi.mocked(useAppBar).mockReturnValue(
    buildAppBarView({ isVisible: false, userMenuItems: [], ...overrides }),
  );
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
