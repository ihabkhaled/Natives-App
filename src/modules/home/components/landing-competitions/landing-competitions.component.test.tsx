import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { CompetitionsSectionView } from '../../helpers/landing-competitive-seam.helper';
import { LandingCompetitions } from './landing-competitions.component';

function view(overrides: Partial<CompetitionsSectionView> = {}): CompetitionsSectionView {
  return {
    heading: 'Competitions & ranks',
    intro: 'Where we compete this season.',
    chrome: {
      status: 'ready',
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
      emptyTitle: 'No competitions yet',
      emptyMessage: 'No competitions yet',
    },
    competitions: [
      { id: 'eunc-2026', name: 'EUNC', season: '2026', rankStatus: 'Rank pending' },
      { id: 'eudl-2026', name: 'EUDL', season: '2026', rankStatus: 'Rank pending' },
    ],
    ...overrides,
  };
}

describe('LandingCompetitions', () => {
  it('renders every entered competition with its season and pending rank', () => {
    render(<LandingCompetitions view={view()} />);

    const eunc = screen.getByTestId('landing-competition-card-eunc-2026');
    expect(eunc).toHaveTextContent('EUNC 2026');
    expect(eunc).toHaveTextContent('Rank pending');

    expect(screen.getByTestId('landing-competition-card-eudl-2026')).toHaveTextContent('EUDL 2026');
  });
});
