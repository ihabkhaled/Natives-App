import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { buildPublicCompetitionDetailView } from '../../../../../tests/factories/public-competitions-view.factory';
import { PublicCompetitionDetailView } from './public-competition-detail-view.component';

describe('PublicCompetitionDetailView', () => {
  it('renders the detail page shell titled after the competition', () => {
    render(<PublicCompetitionDetailView {...buildPublicCompetitionDetailView()} />);

    expect(screen.getByTestId(TEST_IDS.publicCompetitionDetailPage)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('EUNC 2026');
  });

  it('publishes SEO metadata distinct from the list page', () => {
    render(<PublicCompetitionDetailView {...buildPublicCompetitionDetailView()} />);

    expect(document.title).toBe('EUNC 2026 — Ultimate Natives');
  });

  it('offers a way back to the competition list', () => {
    const onBack = vi.fn();
    render(<PublicCompetitionDetailView {...buildPublicCompetitionDetailView({ onBack })} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.publicCompetitionBack));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders the summary card, the results table, and the leaderboard together', () => {
    render(<PublicCompetitionDetailView {...buildPublicCompetitionDetailView()} />);

    expect(screen.getByTestId(TEST_IDS.publicCompetitionCard)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.publicCompetitionMatchesTable)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.publicCompetitionLeaderboard)).toBeInTheDocument();
  });

  it('shows a designed empty state for each block that has no results yet', () => {
    render(
      <PublicCompetitionDetailView
        {...buildPublicCompetitionDetailView({ matches: [], leaderboard: [] })}
      />,
    );

    expect(screen.getByText('No match results yet')).toBeInTheDocument();
    expect(screen.getByText('No leaderboard yet')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.publicCompetitionMatchesTable)).not.toBeInTheDocument();
  });

  it('shows the skeleton loader instead of empty result blocks while loading', () => {
    render(
      <PublicCompetitionDetailView
        {...buildPublicCompetitionDetailView({ status: 'loading', summary: null })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.publicCompetitionDetailLoading)).toBeInTheDocument();
    expect(screen.queryByText('No match results yet')).not.toBeInTheDocument();
  });

  it('shows the not-found copy for a competition the showcase does not publish', () => {
    render(
      <PublicCompetitionDetailView
        {...buildPublicCompetitionDetailView({ status: 'empty', summary: null })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.publicCompetitionDetailEmpty)).toHaveTextContent(
      'We could not find that competition',
    );
    expect(screen.queryByTestId(TEST_IDS.publicCompetitionCard)).not.toBeInTheDocument();
  });

  it('shows the designed error state when the read fails', () => {
    render(
      <PublicCompetitionDetailView
        {...buildPublicCompetitionDetailView({ status: 'error', summary: null })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.publicCompetitionDetailError)).toBeInTheDocument();
  });
});
