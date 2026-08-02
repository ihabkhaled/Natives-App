import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ActivePlayersSectionView } from '../../helpers/landing-team-seam.helper';
import { LandingActivePlayers } from './landing-active-players.component';

function view(): ActivePlayersSectionView {
  return {
    heading: 'Active players',
    intro: 'Meet the roster.',
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
      emptyTitle: 'Roster coming soon',
      emptyMessage: 'The active roster is not published yet.',
    },
  };
}

describe('LandingActivePlayers', () => {
  it('renders the heading and the honest empty state', () => {
    render(<LandingActivePlayers view={view()} />);

    expect(screen.getByText('Active players')).toBeInTheDocument();
    expect(screen.getByTestId('landing-players-empty')).toHaveTextContent('Roster coming soon');
  });
});
