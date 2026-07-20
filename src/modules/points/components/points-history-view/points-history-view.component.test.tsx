import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import type { PointsHistoryView } from '../../types/points-view.types';
import { PointsBadgeList } from '../points-badge-list';
import { PointsCategoryChart } from '../points-category-chart';
import { PointsHistoryScreen } from './points-history-view.component';

function view(overrides: Partial<PointsHistoryView> = {}): PointsHistoryView {
  return {
    loadingLabel: 'Loading points…',
    errorTitle: 'Points did not load',
    errorMessage: 'Try again.',
    retryLabel: 'Try again',
    onRetry: vi.fn(),
    offlineTitle: 'You are offline',
    offlineMessage: 'Reconnect.',
    offlineNoticeLabel: 'Reconnect.',
    isOffline: false,
    forbiddenTitle: 'Not available to you',
    forbiddenMessage: 'No permission.',
    emptyTitle: 'Nothing on the board yet',
    emptyMessage: 'No points recorded.',
    title: 'My points',
    subtitle: 'Every award, reversal, and adjustment.',
    status: 'ready',
    totalHeading: 'Total points',
    totalText: '210',
    ledgerHeading: 'Points ledger',
    ledgerIntro: 'Append-only.',
    ledgerEmptyLabel: 'No ledger entries yet.',
    appendOnlyNotice: 'Totals are never edited.',
    entries: [],
    hasEntries: false,
    badgesHeading: 'Badges',
    badgesIntro: 'Awarded by the server.',
    badgesEmptyLabel: 'No badges awarded yet.',
    badges: [],
    candidateHeading: 'Next up',
    candidateIntro: 'Candidate thresholds.',
    candidates: [],
    chart: {
      heading: 'Points by category',
      description: 'Bar chart of category points.',
      emptyLabel: 'No category contributions to chart yet.',
      viewBox: '0 0 320 28',
      bars: [],
      tableToggleLabel: 'Show the numbers',
      tableCaption: 'Points contributed per category',
      columnLabels: ['Category', 'Points'],
      tableRows: [],
    },
    ...overrides,
  };
}

describe('PointsHistoryScreen', () => {
  it('reports an empty ledger without hiding the server total', () => {
    render(<PointsHistoryScreen {...view()} />);

    expect(screen.getByTestId(TEST_IDS.pointsTotal)).toHaveTextContent('210');
    expect(screen.getByText('No ledger entries yet.')).toBeInTheDocument();
  });

  it('lists every ledger entry once there are some', () => {
    render(
      <PointsHistoryScreen
        {...view({
          hasEntries: true,
          entries: [
            {
              id: 'e1',
              typeLabel: 'Award',
              typeTone: 'success',
              amountText: '+120',
              sourceLabel: 'Training claim',
              categoryLabel: 'gym',
              reasonText: 'No reason recorded.',
              ruleVersionLabel: 'Rule version 4',
              dateLabel: '2 Jul 2026',
            },
            {
              id: 'e2',
              typeLabel: 'Manual adjustment',
              typeTone: 'primary',
              amountText: '+20',
              sourceLabel: 'Manual',
              categoryLabel: null,
              reasonText: 'Correcting a mis-scored session',
              ruleVersionLabel: 'Rule version not recorded',
              dateLabel: '7 Jul 2026',
            },
          ],
        })}
      />,
    );

    expect(screen.getAllByTestId(TEST_IDS.pointsLedgerEntry)).toHaveLength(2);
    expect(screen.getByText('Correcting a mis-scored session')).toBeInTheDocument();
  });

  it('presents each non-ready state on its own', () => {
    const { rerender } = render(<PointsHistoryScreen {...view({ status: 'forbidden' })} />);
    expect(screen.getByTestId(TEST_IDS.pointsHistoryForbidden)).toBeInTheDocument();

    rerender(<PointsHistoryScreen {...view({ status: 'loading' })} />);
    expect(screen.getByTestId(TEST_IDS.pointsHistoryLoading)).toBeInTheDocument();
  });
});

describe('PointsBadgeList', () => {
  it('reports no badges plainly and still offers the candidate tiers', () => {
    render(
      <PointsBadgeList
        badges={[]}
        emptyLabel="No badges awarded yet."
        heading="Badges"
        intro="Awarded by the server."
        candidateHeading="Next up"
        candidateIntro="Candidate thresholds."
        candidates={[
          {
            key: '100',
            thresholdLabel: 'Threshold 100',
            progressLabel: '90 to go',
            isReached: false,
          },
        ]}
      />,
    );

    expect(screen.getByText('No badges awarded yet.')).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.pointsBadgeCandidate)).toHaveTextContent('Threshold 100');
  });

  it('renders each awarded badge with its award facts', () => {
    render(
      <PointsBadgeList
        badges={[
          {
            badgeKey: 'century',
            label: 'century',
            thresholdLabel: 'Threshold 100',
            pointsAtAwardLabel: '120 points at award',
            awardedLabel: 'Awarded 5 Jul 2026',
          },
        ]}
        emptyLabel="No badges awarded yet."
        heading="Badges"
        intro="Awarded by the server."
        candidateHeading="Next up"
        candidateIntro="Candidate thresholds."
        candidates={[
          {
            key: '200',
            thresholdLabel: 'Threshold 200',
            progressLabel: 'Threshold reached',
            isReached: true,
          },
        ]}
      />,
    );

    expect(screen.getByTestId(TEST_IDS.pointsBadge)).toHaveTextContent('120 points at award');
    expect(screen.getByTestId(TEST_IDS.pointsBadgeCandidate).className).toContain('--reached');
  });
});

describe('PointsCategoryChart', () => {
  it('says there is nothing to chart rather than drawing an empty axis', () => {
    render(<PointsCategoryChart view={view().chart} />);

    expect(screen.getByText('No category contributions to chart yet.')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('draws one accessible bar per category with a tabular alternative', () => {
    render(
      <PointsCategoryChart
        view={{
          ...view().chart,
          bars: [
            {
              key: 'gym',
              label: 'gym',
              valueText: '120',
              x: 0,
              y: 0,
              width: 320,
              height: 28,
              labelY: 14,
            },
          ],
          tableRows: [{ key: 'gym', label: 'gym', valueText: '120' }],
        }}
      />,
    );

    expect(screen.getByRole('img').getAttribute('aria-label')).toBeTruthy();
    expect(screen.getByTestId(TEST_IDS.chartDataTable)).toBeInTheDocument();
  });
});
