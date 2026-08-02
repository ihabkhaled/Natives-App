import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { LeaderboardSectionView } from '../../helpers/landing-competitive-seam.helper';
import { LandingLeaderboard } from './landing-leaderboard.component';

function view(): LeaderboardSectionView {
  return {
    heading: 'Leaderboard',
    intro: 'Top individual scorers per competition.',
    chrome: {
      status: 'empty',
      loadingLabel: 'Loading…',
      errorTitle: 'Error',
      errorMessage: 'Error',
      retryLabel: 'Retry',
      onRetry: () => {},
      offlineTitle: 'Offline',
      offlineMessage: 'Offline',
      offlineNoticeLabel: 'Offline',
      isOffline: false,
      forbiddenTitle: 'Forbidden',
      forbiddenMessage: 'Forbidden',
      emptyTitle: 'No leaderboard yet',
      emptyMessage: 'The leaderboard unlocks once matches are scored.',
    },
  };
}

describe('LandingLeaderboard', () => {
  it('renders the heading and the honest empty state', () => {
    render(<LandingLeaderboard view={view()} />);

    expect(screen.getByText('Leaderboard')).toBeInTheDocument();
    expect(screen.getByTestId('landing-leaderboard-empty')).toHaveTextContent('No leaderboard yet');
  });
});
