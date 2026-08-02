import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import {
  buildPublicCompetitionDetailView,
  buildPublicMatchRow,
} from '../../../../../tests/factories/public-competitions-view.factory';
import { toPublicMatchRowView } from '../../mappers/public-results.mapper';
import { PublicMatchResultsTable } from './public-match-results-table.component';

const LABELS = buildPublicCompetitionDetailView().matchesLabels;

const FIRST_STRONG_ISOLATE = '⁨';
const POP_DIRECTIONAL_ISOLATE = '⁩';

afterEach(() => {
  document.documentElement.dir = '';
});

describe('PublicMatchResultsTable', () => {
  it('renders a real table with the opponent as each row header', () => {
    render(
      <PublicMatchResultsTable
        labels={LABELS}
        rows={[buildPublicMatchRow()]}
        expandedKey={null}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.publicCompetitionMatchesTable)).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Opponent' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: /Cairo Ultimate/u })).toBeInTheDocument();
  });

  it('carries the outcome as a word, never as colour alone', () => {
    render(
      <PublicMatchResultsTable
        labels={LABELS}
        rows={[buildPublicMatchRow(), buildPublicMatchRow({ key: 'm2', outcome: 'loss' })]}
        expandedKey={null}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getAllByText('Win')).not.toHaveLength(0);
    expect(screen.getAllByText('Loss')).not.toHaveLength(0);
  });

  it('says a fixture is awaiting its score rather than printing a zero', () => {
    render(
      <PublicMatchResultsTable
        labels={LABELS}
        rows={[
          buildPublicMatchRow({
            scoreText: null,
            scoreReadout: null,
            outcome: 'pending',
            dateText: null,
          }),
        ]}
        expandedKey={null}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.publicCompetitionMatchScore)).toHaveTextContent(
      'Awaiting score',
    );
    expect(screen.getByText('Date to be confirmed')).toBeInTheDocument();
  });

  it('expands one match into its individual player scores', () => {
    render(
      <PublicMatchResultsTable
        labels={LABELS}
        rows={[buildPublicMatchRow()]}
        expandedKey="match-1"
        onToggle={vi.fn()}
      />,
    );

    const players = screen.getByTestId(TEST_IDS.publicCompetitionMatchPlayers);
    expect(
      within(players).getByRole('rowheader', { name: 'Sherif Ashraf 33' }),
    ).toBeInTheDocument();
    expect(within(players).getByRole('columnheader', { name: 'Goals' })).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.publicCompetitionMatchToggle)).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('says so when a game recorded no individual scores', () => {
    render(
      <PublicMatchResultsTable
        labels={LABELS}
        rows={[buildPublicMatchRow({ players: [] })]}
        expandedKey="match-1"
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.publicCompetitionMatchPlayers)).toHaveTextContent(
      'Individual scores were not recorded for this game.',
    );
  });

  it('keeps the player table closed, and the toggle collapsed, until asked', () => {
    const onToggle = vi.fn();
    render(
      <PublicMatchResultsTable
        labels={LABELS}
        rows={[buildPublicMatchRow()]}
        expandedKey={null}
        onToggle={onToggle}
      />,
    );

    const toggle = screen.getByTestId(TEST_IDS.publicCompetitionMatchToggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId(TEST_IDS.publicCompetitionMatchPlayers)).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledWith('match-1');
  });
});

/**
 * The bidi regression this module exists to avoid: `8 – 6` written bare into
 * an Arabic paragraph resolves right-to-left around the neutral dash and
 * renders as `6 – 8`, reversing who won. The isolate pair pins the run.
 */
describe('PublicMatchResultsTable score rendering in Arabic (RTL)', () => {
  function renderArabicScore() {
    document.documentElement.dir = 'rtl';
    const row = toPublicMatchRowView(
      {
        matchId: 'match-1',
        opponentName: 'Cairo Ultimate',
        playedAt: null,
        ourScore: 8,
        opponentScore: 6,
        playerScores: [],
      },
      'ar',
      (key: string, params?: Record<string, string | number>) =>
        `${String(params?.['ours'])} - ${String(params?.['opponent'])} ${String(params?.['theirs'])} (${key})`,
    );
    render(
      <PublicMatchResultsTable
        labels={LABELS}
        rows={[row]}
        expandedKey={null}
        onToggle={vi.fn()}
      />,
    );
    return screen.getByTestId(TEST_IDS.publicCompetitionMatchScore);
  }

  it('keeps our score first inside a bidi isolate', () => {
    const cell = renderArabicScore();

    expect(cell.textContent).toContain(`${FIRST_STRONG_ISOLATE}8 – 6${POP_DIRECTIONAL_ISOLATE}`);
    expect(cell.textContent).not.toContain('6 – 8');
  });

  it('keeps Latin digits so a score stays scannable in both scripts', () => {
    expect(renderArabicScore().textContent).toContain('8 – 6');
  });

  it('offers a spelled-out alternative to assistive tech and hides the glyph run', () => {
    const cell = renderArabicScore();

    expect(cell).toHaveTextContent('8 - Cairo Ultimate 6');
    expect(
      within(cell).getByText(`${FIRST_STRONG_ISOLATE}8 – 6${POP_DIRECTIONAL_ISOLATE}`),
    ).toHaveAttribute('aria-hidden', 'true');
  });
});
