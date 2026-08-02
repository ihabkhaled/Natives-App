import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildPublicCompetitionCard,
  buildPublicCompetitionsScreenView,
} from '../../../../../tests/factories/public-competitions-view.factory';
import { PublicCompetitionCard } from './public-competition-card.component';

const LABELS = buildPublicCompetitionsScreenView().labels;

describe('PublicCompetitionCard', () => {
  it('names the competition and its season', () => {
    render(<PublicCompetitionCard card={buildPublicCompetitionCard()} labels={LABELS} />);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('EUNC 2026');
    expect(screen.getByTestId(TEST_IDS.publicCompetitionCard)).toHaveTextContent('2026');
  });

  it('says results are pending instead of printing a placing nobody published', () => {
    render(<PublicCompetitionCard card={buildPublicCompetitionCard()} labels={LABELS} />);

    expect(screen.getByTestId(TEST_IDS.publicCompetitionFinish)).toHaveTextContent(
      'Results pending',
    );
  });

  it('shows the real finish and field size once they are published', () => {
    render(
      <PublicCompetitionCard
        card={buildPublicCompetitionCard({
          isResultPending: false,
          rankText: '3',
          entrantsText: 'of 12 teams',
        })}
        labels={LABELS}
      />,
    );

    const finish = screen.getByTestId(TEST_IDS.publicCompetitionFinish);
    expect(finish).toHaveTextContent('3');
    expect(finish).toHaveTextContent('of 12 teams');
    expect(finish).not.toHaveTextContent('Results pending');
  });

  it('labels an unpublished fact rather than leaving the row blank', () => {
    render(<PublicCompetitionCard card={buildPublicCompetitionCard()} labels={LABELS} />);

    expect(screen.getAllByText('Not published yet')).toHaveLength(3);
  });

  it('renders the published facts when the organiser has supplied them', () => {
    render(
      <PublicCompetitionCard
        card={buildPublicCompetitionCard({
          formatText: 'Mixed outdoor',
          locationText: 'Bruges, Belgium',
          datesText: '12 June 2026 – 14 June 2026',
        })}
        labels={LABELS}
      />,
    );

    expect(screen.getByText('Mixed outdoor')).toBeInTheDocument();
    expect(screen.getByText('Bruges, Belgium')).toBeInTheDocument();
    expect(screen.queryByText('Not published yet')).not.toBeInTheDocument();
  });

  it('opens the competition by its resolved detail path', () => {
    const onOpen = vi.fn();
    render(
      <PublicCompetitionCard card={buildPublicCompetitionCard()} labels={LABELS} onOpen={onOpen} />,
    );

    fireEvent.click(screen.getByTestId(TEST_IDS.publicCompetitionCardLink));
    expect(onOpen).toHaveBeenCalledWith('/results/eunc-2026');
  });

  it('drops the open action where the card is already the destination', () => {
    render(<PublicCompetitionCard card={buildPublicCompetitionCard()} labels={LABELS} />);

    expect(screen.queryByTestId(TEST_IDS.publicCompetitionCardLink)).not.toBeInTheDocument();
  });
});
