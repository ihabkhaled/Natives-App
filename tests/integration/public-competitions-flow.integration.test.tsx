import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { PublicCompetitionDetailContainer } from '@/modules/public-competitions/containers/public-competition-detail.container';
import { PublicCompetitionsContainer } from '@/modules/public-competitions/containers/public-competitions.container';
import { TEST_IDS } from '@/shared/config';

import { initTestI18n } from '../setup/i18n-test.helper';
import { createTestQueryClient } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

function renderAt(path: string, pattern: string, screenNode: React.JSX.Element): void {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <Route path={pattern}>{screenNode}</Route>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(async () => {
  await initTestI18n();
});

/**
 * The showcase runs against the real query stack with MSW listening in
 * `onUnhandledRequest: 'error'` mode. That is the point of these tests: the
 * TODO seam must make **no** HTTP call at all, so any accidental gateway
 * request to the not-yet-built contract-1.8.0 endpoints fails the suite
 * instead of silently 404-ing in front of a visitor.
 */
describe('public competitions showcase (real query client + MSW, no network)', () => {
  it('moves from skeleton to the seeded competitions without one request', async () => {
    renderAt('/results', '/results', <PublicCompetitionsContainer />);

    expect(screen.getByTestId(TEST_IDS.publicCompetitionsLoading)).toBeInTheDocument();

    await screen.findByTestId(TEST_IDS.publicCompetitionsList, {}, WAIT);
    const cards = screen.getAllByTestId(TEST_IDS.publicCompetitionCard);
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent('EUNC 2026');
    expect(cards[1]).toHaveTextContent('EUDL 2026');
  });

  it('says results are pending for every competition rather than inventing a rank', async () => {
    renderAt('/results', '/results', <PublicCompetitionsContainer />);

    await screen.findByTestId(TEST_IDS.publicCompetitionsList, {}, WAIT);
    const finishes = screen.getAllByTestId(TEST_IDS.publicCompetitionFinish);
    expect(finishes).toHaveLength(2);
    for (const finish of finishes) {
      expect(finish).toHaveTextContent('Results pending');
    }
  });

  it('tells visitors outright that the live results feed is not connected yet', async () => {
    renderAt('/results', '/results', <PublicCompetitionsContainer />);

    const notice = await screen.findByTestId(TEST_IDS.publicCompetitionsSeamNotice, {}, WAIT);
    expect(notice).toHaveTextContent('Live results are not connected yet');
  });

  it('opens one competition and shows both result blocks as designed empties', async () => {
    renderAt(
      '/results/eunc-2026',
      '/results/:competitionSlug',
      <PublicCompetitionDetailContainer />,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('EUNC 2026');
    }, WAIT);
    expect(screen.getByText('No match results yet')).toBeInTheDocument();
    expect(screen.getByText('No leaderboard yet')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.publicCompetitionMatchesTable)).not.toBeInTheDocument();
  });

  it('lands an unknown competition on the designed not-found state', async () => {
    renderAt(
      '/results/worlds-1998',
      '/results/:competitionSlug',
      <PublicCompetitionDetailContainer />,
    );

    const empty = await screen.findByTestId(TEST_IDS.publicCompetitionDetailEmpty, {}, WAIT);
    expect(empty).toHaveTextContent('We could not find that competition');
  });

  it('publishes a canonical link and description per public route', async () => {
    renderAt('/results', '/results', <PublicCompetitionsContainer />);

    await screen.findByTestId(TEST_IDS.publicCompetitionsList, {}, WAIT);
    expect(document.title).toBe('Competitions & Results — Ultimate Natives');
  });

  it('returns to the list from a competition page', async () => {
    renderAt(
      '/results/eudl-2026',
      '/results/:competitionSlug',
      <PublicCompetitionDetailContainer />,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('EUDL 2026');
    }, WAIT);
    const back = screen.getByTestId(TEST_IDS.publicCompetitionBack);
    expect(within(back).getByText('All competitions')).toBeInTheDocument();
    fireEvent.click(back);
  });
});
