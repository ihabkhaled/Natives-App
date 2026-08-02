import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildPublicCompetitionCard,
  buildPublicCompetitionsScreenView,
} from '../../../../../tests/factories/public-competitions-view.factory';
import { PublicCompetitionsView } from './public-competitions-view.component';

describe('PublicCompetitionsView', () => {
  it('renders the showcase page shell with its hero heading', () => {
    render(<PublicCompetitionsView {...buildPublicCompetitionsScreenView()} />);

    expect(screen.getByTestId(TEST_IDS.publicCompetitionsPage)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Competitions & Results');
  });

  it('publishes per-route SEO metadata', () => {
    render(
      <PublicCompetitionsView
        {...buildPublicCompetitionsScreenView({ seoTitle: 'Competitions — Ultimate Natives' })}
      />,
    );

    expect(document.title).toBe('Competitions — Ultimate Natives');
  });

  it('announces the not-connected notice as a live status region', () => {
    render(<PublicCompetitionsView {...buildPublicCompetitionsScreenView()} />);

    const notice = screen.getByTestId(TEST_IDS.publicCompetitionsSeamNotice);
    expect(notice).toHaveAttribute('role', 'status');
    expect(notice).toHaveAttribute('aria-live', 'polite');
    expect(notice).toHaveTextContent('Live results are not connected yet');
  });

  it('hides the notice once the showcase endpoint is live', () => {
    render(
      <PublicCompetitionsView
        {...buildPublicCompetitionsScreenView({ isSeamNoticeVisible: false })}
      />,
    );

    expect(screen.queryByTestId(TEST_IDS.publicCompetitionsSeamNotice)).not.toBeInTheDocument();
  });

  it('lists one card per competition when the read is ready', () => {
    render(
      <PublicCompetitionsView
        {...buildPublicCompetitionsScreenView({
          cards: [
            buildPublicCompetitionCard(),
            buildPublicCompetitionCard({ key: 'eudl-2026', slug: 'eudl-2026', name: 'EUDL 2026' }),
          ],
        })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.publicCompetitionsList)).toBeInTheDocument();
    expect(screen.getAllByTestId(TEST_IDS.publicCompetitionCard)).toHaveLength(2);
  });

  it('shows the skeleton loader instead of an empty grid while loading', () => {
    render(
      <PublicCompetitionsView {...buildPublicCompetitionsScreenView({ status: 'loading' })} />,
    );

    expect(screen.getByTestId(TEST_IDS.publicCompetitionsLoading)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.publicCompetitionsList)).not.toBeInTheDocument();
  });

  it('shows the designed error state with a retry action', () => {
    render(<PublicCompetitionsView {...buildPublicCompetitionsScreenView({ status: 'error' })} />);

    expect(screen.getByTestId(TEST_IDS.publicCompetitionsError)).toHaveTextContent(
      'We could not load the competitions',
    );
  });

  it('shows the designed empty state when nothing is published yet', () => {
    render(
      <PublicCompetitionsView
        {...buildPublicCompetitionsScreenView({ status: 'empty', cards: [] })}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.publicCompetitionsEmpty)).toHaveTextContent(
      'No competitions published yet',
    );
  });
});
