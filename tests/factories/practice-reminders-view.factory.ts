import { vi } from 'vitest';

import type { PracticeRemindersScreenView } from '@/modules/practice-reminders';

/** A ready reminders screen: fifteen eligible, four yet to reply, window open. */
export function buildPracticeRemindersScreenView(
  overrides: Partial<PracticeRemindersScreenView> = {},
): PracticeRemindersScreenView {
  return {
    title: 'Reminders',
    subtitle: 'Who still has to hear about this session.',
    isLoading: false,
    loadingLabel: 'Checking reminders…',
    isForbidden: false,
    hasError: false,
    errorTitle: 'Reminders unavailable',
    errorMessage: 'The reminder status could not be read.',
    eligibleLabel: '15 eligible',
    noResponseLabel: '4 have not replied',
    windowLabel: 'The reminder window is open.',
    kindsHeading: 'Reminders due',
    kindLabels: ['rsvp_reminder'],
    kindsEmptyLabel: 'Nothing is due for this session right now.',
    dispatchLabel: 'Send due reminders',
    canDispatch: true,
    isDispatching: false,
    onDispatch: vi.fn(),
    testLabel: 'Send a test to myself',
    isTesting: false,
    onTest: vi.fn(),
    messages: [],
    ...overrides,
  };
}
