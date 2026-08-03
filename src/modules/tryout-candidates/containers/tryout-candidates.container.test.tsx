import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildTryoutCandidatesScreenView } from '../../../../tests/factories/tryout-candidates-view.factory';
import { useTryoutCandidatesScreen } from '../hooks/use-tryout-candidates-screen.hook';
import { TryoutCandidatesContainer } from './tryout-candidates.container';

vi.mock('../hooks/use-tryout-candidates-screen.hook', () => ({
  useTryoutCandidatesScreen: vi.fn(),
}));

describe('TryoutCandidatesContainer', () => {
  it('composes the screen hook with the presentational view', () => {
    vi.mocked(useTryoutCandidatesScreen).mockReturnValue(
      buildTryoutCandidatesScreenView({ status: 'empty', rows: [] }),
    );

    render(<TryoutCandidatesContainer />);

    expect(screen.getByTestId(TEST_IDS.tryoutCandidatesView)).toBeInTheDocument();
    expect(screen.getByText('No candidates yet')).toBeInTheDocument();
  });
});
