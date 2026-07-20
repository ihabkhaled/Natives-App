import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { LeaderboardContainer } from '@/modules/points/containers/leaderboard.container';
import { PointsHistoryContainer } from '@/modules/points/containers/points-history.container';
import { TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { fireIonChange } from '../setup/ionic-events.helper';
import { createTestQueryClient } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

function renderAt(path: string, screenNode: React.JSX.Element): void {
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <Route path={path}>{screenNode}</Route>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('leaderboard and points ledger flow (real client + MSW)', () => {
  it('renders the standings as a real table with row headers', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderAt('/leaderboard', <LeaderboardContainer />);

    await screen.findByTestId(TEST_IDS.leaderboardTable, {}, WAIT);
    expect(screen.getAllByTestId(TEST_IDS.leaderboardRow).length).toBe(4);
    expect(screen.getByRole('columnheader', { name: 'Rank' })).toBeInTheDocument();
  });

  it('keeps a zero-contribution member on the board instead of hiding them', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderAt('/leaderboard', <LeaderboardContainer />);

    await screen.findByTestId(TEST_IDS.leaderboardTable, {}, WAIT);
    const rows = screen.getAllByTestId(TEST_IDS.leaderboardRow);
    const zeroRow = rows.find((row) => row.className.includes('--zero'));
    expect(zeroRow).toBeDefined();
    expect(zeroRow).toHaveTextContent('0');
    expect(screen.getByTestId(TEST_IDS.leaderboardTieRule)).toHaveTextContent(
      'stay on the board at 0',
    );
  });

  it('states the tie-break rule the server applied and labels the tied rows', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderAt('/leaderboard', <LeaderboardContainer />);

    await screen.findByTestId(TEST_IDS.leaderboardTieRule, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.leaderboardTieRule)).toHaveTextContent(
      'the next rank skips ahead',
    );
    expect(screen.getAllByText('Tied on points').length).toBe(2);
  });

  it('reports rank movement with a text label, not colour alone', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderAt('/leaderboard', <LeaderboardContainer />);

    await screen.findByTestId(TEST_IDS.leaderboardTable, {}, WAIT);
    const movements = screen.getAllByTestId(TEST_IDS.leaderboardMovement);
    expect(movements[0]).toHaveTextContent('Moved up');
    expect(movements[3]).toHaveTextContent('First appearance on this board');
  });

  it('explains one row rank from the server contributions and rule version', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderAt('/leaderboard', <LeaderboardContainer />);

    await screen.findByTestId(TEST_IDS.leaderboardTable, {}, WAIT);
    fireEvent.click(screen.getAllByTestId(TEST_IDS.leaderboardExplainToggle)[0]!);

    const panel = await screen.findByTestId(TEST_IDS.leaderboardExplainPanel, {}, WAIT);
    expect(within(panel).getByRole('rowheader', { name: 'gym' })).toBeInTheDocument();
    expect(panel).toHaveTextContent('Rule version not recorded');
    expect(panel).toHaveTextContent('the app never recalculates');
  });

  it('reports a member with no contributions as having none to explain', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderAt('/leaderboard', <LeaderboardContainer />);

    await screen.findByTestId(TEST_IDS.leaderboardTable, {}, WAIT);
    const toggles = screen.getAllByTestId(TEST_IDS.leaderboardExplainToggle);
    fireEvent.click(toggles[3]!);

    const panel = await screen.findByTestId(TEST_IDS.leaderboardExplainPanel, {}, WAIT);
    expect(panel).toHaveTextContent('No contributions in this period');

    fireEvent.click(toggles[3]!);
    await waitFor(() => {
      expect(screen.queryByTestId(TEST_IDS.leaderboardExplainPanel)).not.toBeInTheDocument();
    });
  });

  it('re-scopes the board when the period changes', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderAt('/leaderboard', <LeaderboardContainer />);

    await screen.findByTestId(TEST_IDS.leaderboardTable, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.leaderboardPeriodSelect), 'monthly');

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.leaderboardRow).length).toBe(4);
    });
  });

  it('filters the board by category without dropping any member', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderAt('/leaderboard', <LeaderboardContainer />);

    await screen.findByTestId(TEST_IDS.leaderboardTable, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.leaderboardCategorySelect), 'gym');

    await waitFor(() => {
      expect(screen.getAllByTestId(TEST_IDS.leaderboardRow).length).toBe(4);
    });
  });

  it('re-scopes the board when the cohort changes', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderAt('/leaderboard', <LeaderboardContainer />);

    await screen.findByTestId(TEST_IDS.leaderboardTable, {}, WAIT);
    fireIonChange(screen.getByTestId(TEST_IDS.leaderboardCohortSelect), 'active');

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.leaderboardView)).toHaveTextContent('Standings as of');
    });
  });

  it('waits rather than inventing standings for a principal with no team', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.noTeam);
    renderAt('/leaderboard', <LeaderboardContainer />);

    await screen.findByTestId(TEST_IDS.leaderboardLoading, {}, WAIT);
    expect(screen.queryByTestId(TEST_IDS.leaderboardTable)).not.toBeInTheDocument();
  });

  it('lists awards, reversals, and adjustments as separate ledger entries', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderAt('/points', <PointsHistoryContainer />);

    await screen.findByTestId(TEST_IDS.pointsLedger, {}, WAIT);
    const entries = screen.getAllByTestId(TEST_IDS.pointsLedgerEntry);
    expect(entries.length).toBe(4);
    expect(screen.getAllByText('Reversal').length).toBe(1);
    expect(screen.getAllByText('Manual adjustment').length).toBe(1);
    expect(screen.getByTestId(TEST_IDS.pointsHistoryView)).toHaveTextContent(
      'totals are never edited',
    );
  });

  it('shows the server total rather than a recomputed one', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderAt('/points', <PointsHistoryContainer />);

    await screen.findByTestId(TEST_IDS.pointsTotal, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.pointsTotal)).toHaveTextContent('210');
  });

  it('shows only awarded badges and offers the remaining tiers as candidates', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderAt('/points', <PointsHistoryContainer />);

    await screen.findByTestId(TEST_IDS.pointsBadgeList, {}, WAIT);
    expect(screen.getAllByTestId(TEST_IDS.pointsBadge).length).toBe(2);
    const candidates = screen.getAllByTestId(TEST_IDS.pointsBadgeCandidate);
    expect(candidates.length).toBe(1);
    expect(candidates[0]).toHaveTextContent('Threshold 450');
  });

  it('never shows the unresolved legacy badge tier', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderAt('/points', <PointsHistoryContainer />);

    await screen.findByTestId(TEST_IDS.pointsBadgeList, {}, WAIT);
    expect(screen.getByTestId(TEST_IDS.pointsHistoryView).textContent).not.toContain('649');
  });

  it('charts the category contributions with a tabular alternative', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderAt('/points', <PointsHistoryContainer />);

    const chart = await screen.findByTestId(TEST_IDS.pointsCategoryChart, {}, WAIT);
    expect(within(chart).getByRole('img').getAttribute('aria-label')).toBeTruthy();
    expect(within(chart).getByTestId(TEST_IDS.chartDataTable)).toBeInTheDocument();
    expect(within(chart).getByRole('rowheader', { name: 'gym' })).toBeInTheDocument();
  });
});
