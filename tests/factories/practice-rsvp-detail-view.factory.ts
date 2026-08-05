import { vi } from 'vitest';

import type { RsvpDetailScreenView } from '@/modules/practice-rsvp-detail';

/** A ready RSVP-detail screen: one roster row, a summary, and no panel open. */
export function buildRsvpDetailScreenView(
  overrides: Partial<RsvpDetailScreenView> = {},
): RsvpDetailScreenView {
  return {
    title: 'RSVPs',
    subtitle: 'Who is coming to this session, and the summary counts.',
    isLoading: false,
    loadingLabel: 'Checking RSVPs…',
    isForbidden: false,
    hasError: false,
    errorTitle: 'RSVPs unavailable',
    errorMessage: 'The roster for this session could not be read.',
    summary: {
      headingLabel: 'Planning summary',
      goingLabel: '12 going',
      maybeLabel: '2 maybe',
      notGoingLabel: '3 not going',
      noResponseLabel: '4 have not replied',
      waitlistedLabel: '1 waitlisted',
      capacityLabel: 'Capacity 20',
      spotsRemainingLabel: '8 spots remaining',
    },
    statusFilterLabel: 'Filter by response',
    statusFilterOptions: [
      { value: '', label: 'Every response' },
      { value: 'going', label: 'Going' },
    ],
    statusFilter: '',
    onStatusFilterChange: vi.fn(),
    countLabel: '5 on the roster',
    rows: [
      {
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
      },
    ],
    emptyLabel: 'Nobody matches this filter yet.',
    hasMore: false,
    isLoadingMore: false,
    loadMoreLabel: 'Show more of the roster',
    onLoadMore: vi.fn(),
    panel: { kind: 'none' },
    ...overrides,
  };
}
