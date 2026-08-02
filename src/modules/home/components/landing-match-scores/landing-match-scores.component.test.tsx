import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { MatchScoresSectionView } from '../../helpers/landing-competitive-seam.helper';
import { LandingMatchScores } from './landing-match-scores.component';

function view(): MatchScoresSectionView {
  return {
    heading: 'Recent match scores',
    intro: 'How we did on the field.',
    chrome: {
      status: 'empty',
      loadingLabel: 'Loading…',
      errorTitle: 'Error',
      errorMessage: 'Error',
      retryLabel: 'Retry',
      onRetry: vi.fn(),
      offlineTitle: 'Offline',
      offlineMessage: 'Offline',
      offlineNoticeLabel: 'Offline',
      isOffline: false,
      forbiddenTitle: 'Forbidden',
      forbiddenMessage: 'Forbidden',
      emptyTitle: 'No results yet',
      emptyMessage: 'Match scores are not published yet.',
    },
  };
}

describe('LandingMatchScores', () => {
  it('renders the heading and the honest empty state', () => {
    render(<LandingMatchScores view={view()} />);

    expect(screen.getByText('Recent match scores')).toBeInTheDocument();
    expect(screen.getByTestId('landing-matches-empty')).toHaveTextContent('No results yet');
  });
});
