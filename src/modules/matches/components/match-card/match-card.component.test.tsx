import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { MatchCard } from './match-card.component';
import type { MatchCardView } from '../../types/matches-view.types';

const ITEM: MatchCardView = {
  id: 'match-1',
  title: 'Live',
  scoreLabel: '8 – 6',
  statusLabel: 'Live',
  statusTone: 'success',
  resultLabel: 'Undecided',
  homeAwayLabel: 'Playing home',
  isLive: true,
  openScoreboardLabel: 'Open scoreboard',
  openStatisticsLabel: 'Open statistics',
};

describe('MatchCard', () => {
  it('leads with the score and offers both entry points', () => {
    const onOpenScoreboard = vi.fn();
    const onOpenStatistics = vi.fn();
    render(
      <MatchCard
        item={ITEM}
        onOpenScoreboard={onOpenScoreboard}
        onOpenStatistics={onOpenStatistics}
      />,
    );

    expect(screen.getByText('8 – 6')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(TEST_IDS.matchOpenScoreboard));
    fireEvent.click(screen.getByTestId(TEST_IDS.matchOpenStatistics));

    expect(onOpenScoreboard).toHaveBeenCalledWith('match-1');
    expect(onOpenStatistics).toHaveBeenCalledWith('match-1');
  });

  it('marks a live match with the arc modifier and a finished one without', () => {
    const { rerender } = render(
      <MatchCard item={ITEM} onOpenScoreboard={vi.fn()} onOpenStatistics={vi.fn()} />,
    );
    expect(screen.getByTestId(TEST_IDS.matchCard).className).toContain('app-match-card--live');

    rerender(
      <MatchCard
        item={{ ...ITEM, isLive: false }}
        onOpenScoreboard={vi.fn()}
        onOpenStatistics={vi.fn()}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.matchCard).className).not.toContain('app-match-card--live');
  });
});
