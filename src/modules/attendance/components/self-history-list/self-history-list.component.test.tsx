import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import type { SelfHistoryListView, SelfHistoryRowView } from '../../types/attendance-view.types';
import { SelfHistoryList } from './self-history-list.component';

function buildRow(overrides: Partial<SelfHistoryRowView> = {}): SelfHistoryRowView {
  return {
    sessionId: 'sess-h-1',
    dateLabel: '19 Jul, 5:00 PM',
    typeLabel: 'Practice',
    statusLabel: 'Present',
    statusTone: 'success',
    latenessLabel: null,
    excuseLabel: null,
    sourceLabel: 'Recorded by you',
    notFinalizedHint: null,
    ...overrides,
  };
}

function buildView(overrides: Partial<SelfHistoryListView> = {}): SelfHistoryListView {
  return {
    title: 'History',
    isLoading: false,
    loadingLabel: 'Loading…',
    rows: [buildRow()],
    emptyTitle: 'No attendance yet',
    emptyMessage: 'Records appear when you check in.',
    loadMoreLabel: 'Load more',
    canLoadMore: false,
    onLoadMore: vi.fn(),
    ...overrides,
  };
}

describe('SelfHistoryList', () => {
  it('renders one translated row with its date, type, source, and status chip', () => {
    render(<SelfHistoryList view={buildView()} />);

    const row = screen.getByTestId(TEST_IDS.myAttendanceHistoryRow);
    expect(row).toHaveTextContent('19 Jul, 5:00 PM');
    expect(row).toHaveTextContent('Practice');
    expect(row).toHaveTextContent('Recorded by you');
    expect(row).toHaveTextContent('Present');
    expect(screen.queryByTestId(TEST_IDS.myAttendanceHistoryLoadMore)).not.toBeInTheDocument();
  });

  it('shows the lateness, excuse, and not-finalized hints when the row carries them', () => {
    render(
      <SelfHistoryList
        view={buildView({
          rows: [
            buildRow({
              statusLabel: 'Late',
              latenessLabel: '12 min late',
              excuseLabel: 'Travel',
              notFinalizedHint: 'Not finalized yet',
              sourceLabel: null,
            }),
          ],
        })}
      />,
    );

    const row = screen.getByTestId(TEST_IDS.myAttendanceHistoryRow);
    expect(row).toHaveTextContent('12 min late');
    expect(row).toHaveTextContent('Travel');
    expect(row).toHaveTextContent('Not finalized yet');
  });

  it('grows the window through the load-more action', () => {
    const view = buildView({ canLoadMore: true });
    render(<SelfHistoryList view={view} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.myAttendanceHistoryLoadMore));
    expect(view.onLoadMore).toHaveBeenCalledOnce();
  });

  it('renders the honest empty state and the loading skeleton apart', () => {
    const { unmount } = render(<SelfHistoryList view={buildView({ rows: [] })} />);
    expect(screen.getByTestId(TEST_IDS.myAttendanceHistoryEmpty)).toBeInTheDocument();
    unmount();

    render(<SelfHistoryList view={buildView({ rows: [], isLoading: true })} />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.myAttendanceHistoryEmpty)).not.toBeInTheDocument();
  });
});
