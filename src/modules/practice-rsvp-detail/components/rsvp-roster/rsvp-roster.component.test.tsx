import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TEST_IDS } from '@/shared/config';

import { RsvpRoster } from './rsvp-roster.component';
import type { RsvpRosterProps } from './rsvp-roster.types';

function row(overrides: Partial<RsvpRosterProps['rows'][number]> = {}): RsvpRosterProps['rows'][number] {
  return {
    membershipId: 'member-1',
    idLabel: 'member-1',
    statusLabel: 'Going',
    statusTone: 'success',
    sourceLabel: 'Answered themselves',
    respondedAtLabel: 'July 20, 2026 9:00 AM',
    detailLabel: 'July 20, 2026 9:00 AM',
    waitlistedLabel: null,
    overrideLabel: 'Override',
    historyLabel: 'History',
    onOverride: vi.fn(),
    onViewHistory: vi.fn(),
    ...overrides,
  };
}

function props(overrides: Partial<RsvpRosterProps> = {}): RsvpRosterProps {
  return {
    statusFilterLabel: 'Filter by response',
    statusFilterOptions: [{ value: '', label: 'Every response' }],
    statusFilter: '',
    onStatusFilterChange: vi.fn(),
    countLabel: '1 on the roster',
    rows: [row()],
    emptyLabel: 'Nobody matches this filter yet.',
    hasMore: false,
    isLoadingMore: false,
    loadMoreLabel: 'Show more of the roster',
    onLoadMore: vi.fn(),
    ...overrides,
  };
}

describe('RsvpRoster', () => {
  it('renders one row per participant', () => {
    render(<RsvpRoster {...props()} />);

    expect(screen.getByTestId(TEST_IDS.practiceRsvpDetailRoster)).toBeInTheDocument();
    expect(screen.getAllByTestId(TEST_IDS.practiceRsvpDetailRosterRow)).toHaveLength(1);
  });

  it('shows the empty state instead of a list when nothing matches the filter', () => {
    render(<RsvpRoster {...props({ rows: [] })} />);

    expect(screen.getByTestId(TEST_IDS.practiceRsvpDetailRosterEmpty)).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.practiceRsvpDetailRoster)).not.toBeInTheDocument();
  });

  it('runs each row action from its own button', () => {
    const onOverride = vi.fn();
    const onViewHistory = vi.fn();
    render(<RsvpRoster {...props({ rows: [row({ onOverride, onViewHistory })] })} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.practiceRsvpDetailOverrideAction));
    fireEvent.click(screen.getByTestId(TEST_IDS.practiceRsvpDetailHistoryAction));

    expect(onOverride).toHaveBeenCalledTimes(1);
    expect(onViewHistory).toHaveBeenCalledTimes(1);
  });

  it('offers "load more" only while the roster has more to show', () => {
    const { rerender } = render(<RsvpRoster {...props({ hasMore: false })} />);
    expect(screen.queryByTestId(TEST_IDS.practiceRsvpDetailLoadMore)).not.toBeInTheDocument();

    rerender(<RsvpRoster {...props({ hasMore: true })} />);
    expect(screen.getByTestId(TEST_IDS.practiceRsvpDetailLoadMore)).toBeInTheDocument();
  });

  it('runs onLoadMore from its own button', () => {
    const onLoadMore = vi.fn();
    render(<RsvpRoster {...props({ hasMore: true, onLoadMore })} />);

    fireEvent.click(screen.getByTestId(TEST_IDS.practiceRsvpDetailLoadMore));

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});
