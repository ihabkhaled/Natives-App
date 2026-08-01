import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPublicNavView } from '../../../../tests/factories/public-nav-view.factory';

import { PublicNavContainer } from './public-nav.container';
import type { PublicNavView } from './public-nav.types';
import { usePublicNav } from './use-public-nav.hook';

vi.mock('./use-public-nav.hook', () => ({ usePublicNav: vi.fn() }));

function mockView(overrides: Partial<PublicNavView>): void {
  vi.mocked(usePublicNav).mockReturnValue(buildPublicNavView(overrides));
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('PublicNavContainer', () => {
  it('renders nothing while the public nav is not visible', () => {
    mockView({ isVisible: false });

    render(<PublicNavContainer />);

    expect(screen.queryByTestId(TEST_IDS.publicNav)).not.toBeInTheDocument();
  });

  it('renders the navbar with the brand once it is visible', () => {
    mockView({ isVisible: true, brandName: 'Ultimate Natives' });

    render(<PublicNavContainer />);

    expect(screen.getByTestId(TEST_IDS.publicNav)).toBeInTheDocument();
    expect(screen.getByText('Ultimate Natives')).toBeInTheDocument();
  });
});
