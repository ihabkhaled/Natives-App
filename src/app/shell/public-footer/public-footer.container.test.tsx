import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPublicFooterView } from '../../../../tests/factories/public-footer-view.factory';

import { PublicFooterContainer } from './public-footer.container';
import type { PublicFooterView } from './public-footer.types';
import { usePublicFooter } from './use-public-footer.hook';

vi.mock('./use-public-footer.hook', () => ({ usePublicFooter: vi.fn() }));

function mockView(overrides: Partial<PublicFooterView>): void {
  vi.mocked(usePublicFooter).mockReturnValue(buildPublicFooterView(overrides));
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('PublicFooterContainer', () => {
  it('renders nothing while the public footer is not visible', () => {
    mockView({ isVisible: false });

    render(<PublicFooterContainer />);

    expect(screen.queryByTestId(TEST_IDS.publicFooter)).not.toBeInTheDocument();
  });

  it('renders the footer with the brand once it is visible', () => {
    mockView({ isVisible: true, brandName: 'Ultimate Natives' });

    render(<PublicFooterContainer />);

    expect(screen.getByTestId(TEST_IDS.publicFooter)).toBeInTheDocument();
    expect(screen.getByText('Ultimate Natives')).toBeInTheDocument();
  });
});
