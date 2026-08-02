import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildPublicCompetitionDetailView,
  buildPublicLeaderboardRow,
} from '../../../../../tests/factories/public-competitions-view.factory';
import { PublicLeaderboardTable } from './public-leaderboard-table.component';

const LABELS = buildPublicCompetitionDetailView().leaderboardLabels;

describe('PublicLeaderboardTable', () => {
  it('renders a real table with the player as each row header', () => {
    render(<PublicLeaderboardTable labels={LABELS} rows={[buildPublicLeaderboardRow()]} />);

    expect(screen.getByTestId(TEST_IDS.publicCompetitionLeaderboard)).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Rank' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Sherif Ashraf' })).toBeInTheDocument();
  });

  it('prints the server rank and points for every row', () => {
    render(
      <PublicLeaderboardTable
        labels={LABELS}
        rows={[
          buildPublicLeaderboardRow(),
          buildPublicLeaderboardRow({
            key: 'p2',
            rankText: '2',
            displayName: 'Rawan Elessawy',
            pointsText: '24',
            barPercent: 50,
            isLeader: false,
          }),
        ]}
      />,
    );

    const rows = screen.getAllByTestId(TEST_IDS.publicCompetitionLeaderboardRow);
    expect(rows).toHaveLength(2);
    expect(rows[1]).toHaveTextContent('24');
  });

  it('keeps a zero-point player on the board', () => {
    render(
      <PublicLeaderboardTable
        labels={LABELS}
        rows={[
          buildPublicLeaderboardRow({
            key: 'p3',
            rankText: '9',
            displayName: 'Lina',
            pointsText: '0',
            barPercent: 0,
            isLeader: false,
          }),
        ]}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.publicCompetitionLeaderboardRow)).toHaveTextContent('0');
  });

  it('draws the meter as decoration, with the numbers left to the cells', () => {
    render(<PublicLeaderboardTable labels={LABELS} rows={[buildPublicLeaderboardRow()]} />);

    const row = screen.getByTestId(TEST_IDS.publicCompetitionLeaderboardRow);
    const meter = within(row).getByText('', { selector: '.app-showcase-board__meter' });
    expect(meter).toHaveAttribute('aria-hidden', 'true');
    expect(row).toHaveTextContent('48');
  });

  it('marks only the leader row', () => {
    render(
      <PublicLeaderboardTable
        labels={LABELS}
        rows={[
          buildPublicLeaderboardRow(),
          buildPublicLeaderboardRow({ key: 'p2', rankText: '2', isLeader: false }),
        ]}
      />,
    );

    const rows = screen.getAllByTestId(TEST_IDS.publicCompetitionLeaderboardRow);
    expect(rows[0]?.className).toContain('leader');
    expect(rows[1]?.className).not.toContain('leader');
  });
});
