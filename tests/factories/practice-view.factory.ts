import { RSVP_STATUS } from '@/modules/practice';
import type {
  PracticeCalendarView,
  PracticeDaySectionView,
  PracticeFilterView,
  PracticeSessionCardView,
  PracticeSessionDetailData,
  PracticeSessionScreenView,
  RsvpControlData,
} from '@/modules/practice/types/practice-view.types';
import { TEST_IDS } from '@/shared/config';

const noop = (): void => undefined;

export function buildPracticeSessionCardView(
  overrides: Partial<PracticeSessionCardView> = {},
): PracticeSessionCardView {
  return {
    id: 'sess-1',
    title: 'Evening practice',
    typeLabel: 'Practice',
    statusLabel: 'Scheduled',
    statusTone: 'medium',
    showStatusBadge: false,
    isCancelled: false,
    timeLabel: '5:00 PM',
    venueLabel: 'Zamalek Club Field',
    rsvpLabel: 'No response yet',
    rsvpTone: 'medium',
    changeLabel: null,
    waitlistLabel: null,
    ...overrides,
  };
}

export function buildPracticeDaySectionView(
  overrides: Partial<PracticeDaySectionView> = {},
): PracticeDaySectionView {
  return {
    dayKey: '2026-07-26',
    dayLabel: 'Sunday, July 26, 2026',
    sessions: [buildPracticeSessionCardView()],
    ...overrides,
  };
}

export function buildPracticeFilterView(
  overrides: Partial<PracticeFilterView> = {},
): PracticeFilterView {
  return {
    scopeLabel: 'When',
    scope: 'upcoming',
    scopeOptions: [
      { value: 'upcoming', label: 'Upcoming' },
      { value: 'all', label: 'All' },
      { value: 'past', label: 'Past' },
    ],
    onScopeChange: noop,
    typeLabel: 'Type',
    typeAllLabel: 'All types',
    type: null,
    typeOptions: [{ value: 'practice', label: 'Practice' }],
    onTypeChange: noop,
    rsvpLabel: 'My response',
    rsvpAllLabel: 'Any response',
    rsvp: null,
    rsvpOptions: [{ value: RSVP_STATUS.going, label: 'Going' }],
    onRsvpChange: noop,
    ...overrides,
  };
}

export function buildRsvpControlData(overrides: Partial<RsvpControlData> = {}): RsvpControlData {
  return {
    prompt: 'Will you attend?',
    yourResponseLabel: 'Your response',
    currentStatusLabel: 'No response yet',
    currentStatusTone: 'medium',
    options: [
      {
        value: RSVP_STATUS.going,
        label: 'Going',
        color: 'success',
        testId: TEST_IDS.rsvpGoingButton,
        isActive: false,
      },
      {
        value: RSVP_STATUS.maybe,
        label: 'Maybe',
        color: 'warning',
        testId: TEST_IDS.rsvpMaybeButton,
        isActive: false,
      },
      {
        value: RSVP_STATUS.notGoing,
        label: 'Not going',
        color: 'danger',
        testId: TEST_IDS.rsvpNotGoingButton,
        isActive: false,
      },
    ],
    reasonLabel: 'Reason (optional)',
    reasonNoneLabel: 'No reason',
    reasonOptions: [{ value: 'injury', label: 'Injury' }],
    showReason: true,
    canRespond: true,
    disabledExplanation: null,
    deadlineLabel: 'Respond by July 25, 2026 3:00 PM',
    waitlistLabel: null,
    ...overrides,
  };
}

export function buildPracticeSessionDetailData(
  overrides: Partial<PracticeSessionDetailData> = {},
): PracticeSessionDetailData {
  return {
    title: 'Evening practice',
    typeLabel: 'Practice',
    statusLabel: 'Scheduled',
    statusTone: 'medium',
    isCancelled: false,
    changeHeading: null,
    changeMessage: null,
    scheduleHeading: 'Schedule',
    scheduleRows: [{ key: 'start', label: 'Start', value: 'July 26, 2026 5:00 PM' }],
    capacityLabel: 'Capacity 24',
    venueHeading: 'Venue',
    venue: {
      name: 'Zamalek Club Field',
      addressLine: '26th of July St',
      mapUrl: 'https://maps.example.com/?q=zamalek',
      directionsLabel: 'Get directions',
      notesHeading: 'Arrival notes',
      notes: 'Enter via Gate 3.',
    },
    venueTbdLabel: 'Venue to be confirmed',
    instructionsHeading: 'Instructions',
    instructions: 'Bring both jerseys.',
    agendaHeading: 'Agenda preview',
    agendaEmptyLabel: 'The agenda has not been shared yet.',
    agenda: [{ id: 'a1', label: 'Throwing', durationLabel: '30 min' }],
    countsHeading: 'Who is coming',
    counts: [{ key: 'going', label: 'Going', countText: '12' }],
    countsPrivateLabel: 'Attendance counts are not shared for this session.',
    updatedLabel: 'Updated July 24, 2026 9:00 AM',
    subscriptionHeading: 'Add to your calendar',
    subscriptionBody: 'Subscribe from Settings.',
    rsvp: buildRsvpControlData(),
    ...overrides,
  };
}

export function buildPracticeSessionScreenView(
  overrides: Partial<PracticeSessionScreenView> = {},
): PracticeSessionScreenView {
  return {
    title: 'Evening practice',
    status: 'ready',
    loadingLabel: 'Loading…',
    errorTitle: 'Something went wrong',
    errorMessage: '',
    retryLabel: 'Try again',
    onRetry: noop,
    offlineTitle: 'You are offline',
    offlineMessage: 'Reconnect to continue.',
    offlineNoticeLabel: 'Showing saved sessions.',
    isOffline: false,
    forbiddenTitle: 'No access',
    forbiddenMessage: 'You cannot view this.',
    attendanceCta: null,
    detail: buildPracticeSessionDetailData(),
    selectedReason: null,
    onSelectReason: noop,
    onSubmitRsvp: noop,
    isSubmitting: false,
    conflictNote: null,
    onOpenMap: noop,
    ...overrides,
  };
}

export function buildPracticeCalendarView(
  overrides: Partial<PracticeCalendarView> = {},
): PracticeCalendarView {
  return {
    title: 'Practice calendar',
    subtitle: 'Sessions shown in Cairo time',
    status: 'ready',
    loadingLabel: 'Loading…',
    errorTitle: 'Something went wrong',
    errorMessage: '',
    retryLabel: 'Try again',
    onRetry: noop,
    offlineTitle: 'You are offline',
    offlineMessage: 'Reconnect to continue.',
    offlineNoticeLabel: 'Showing saved sessions.',
    isOffline: false,
    emptyTitle: 'No sessions match',
    emptyMessage: 'Try a different filter.',
    forbiddenTitle: 'No access',
    forbiddenMessage: 'You cannot view this.',
    filter: buildPracticeFilterView(),
    sections: [buildPracticeDaySectionView()],
    onSelectSession: noop,
    hasMore: false,
    isFetchingMore: false,
    loadMoreLabel: 'Show more sessions',
    onLoadMore: noop,
    boundedNotice: null,
    subscriptionHeading: 'Add to your calendar',
    subscriptionBody: 'Subscribe from Settings.',
    ...overrides,
  };
}
