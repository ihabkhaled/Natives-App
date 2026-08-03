import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildJerseyScreenView } from '../../../../tests/factories/jersey-view.factory';
import { useJerseyScreen } from '../hooks/use-jersey-screen.hook';
import { JerseyContainer } from './jersey.container';

vi.mock('../hooks/use-jersey-screen.hook', () => ({ useJerseyScreen: vi.fn() }));

describe('JerseyContainer', () => {
  it('composes the screen hook with the presentational view', () => {
    vi.mocked(useJerseyScreen).mockReturnValue(
      buildJerseyScreenView({ status: 'empty', rows: [] }),
    );

    render(<JerseyContainer />);

    expect(screen.getByTestId(TEST_IDS.jerseyView)).toBeInTheDocument();
    expect(screen.getByText('No jersey orders yet')).toBeInTheDocument();
  });
});
