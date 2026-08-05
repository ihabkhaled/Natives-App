import { describe, expect, it, vi } from 'vitest';

import type { ReminderStatus } from '../types/practice-reminders.types';
import { buildRemindersView, type RemindersViewInput } from './reminders-view.helper';

/** Echo the key back with its params, so assertions read as key + numbers. */
const translate = (key: string, params?: Readonly<Record<string, number>>): string =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`;

function status(overrides: Partial<ReminderStatus> = {}): ReminderStatus {
  return {
    sessionId: 's1',
    totalEligible: 15,
    noResponse: 4,
    upcoming: true,
    cutoff: false,
    urgentCancellationOverride: false,
    kinds: ['rsvp_reminder'],
    ...overrides,
  };
}

function input(overrides: Partial<RemindersViewInput> = {}): RemindersViewInput {
  return {
    status: status(),
    isLoading: false,
    isForbidden: false,
    hasError: false,
    isDispatching: false,
    isRefreshing: false,
    isTesting: false,
    onDispatch: vi.fn(),
    onTest: vi.fn(),
    messages: [],
    ...overrides,
  };
}

describe('buildRemindersView', () => {
  it('carries the counts through with their numbers', () => {
    const view = buildRemindersView(translate, input());

    expect(view.eligibleLabel).toContain('"count":15');
    expect(view.noResponseLabel).toContain('"count":4');
    expect(view.kindLabels).toEqual(['rsvp_reminder']);
  });

  /**
   * A screen mid-load should read "0 eligible" rather than an empty line that
   * looks like a missing translation.
   */
  it('falls back to zero counts and a blank window before the status arrives', () => {
    const view = buildRemindersView(translate, input({ status: undefined }));

    expect(view.eligibleLabel).toContain('"count":0');
    expect(view.noResponseLabel).toContain('"count":0');
    expect(view.windowLabel).toBe('');
    expect(view.kindLabels).toEqual([]);
    expect(view.canDispatch).toBe(false);
  });

  it('swaps both button labels while their action is in flight', () => {
    const idle = buildRemindersView(translate, input());
    const busy = buildRemindersView(translate, input({ isDispatching: true, isTesting: true }));

    expect(idle.dispatchLabel).toBe('practiceReminders.dispatchAction');
    expect(busy.dispatchLabel).toBe('practiceReminders.dispatchRunning');
    expect(idle.testLabel).toBe('practiceReminders.testAction');
    expect(busy.testLabel).toBe('practiceReminders.testRunning');
  });

  it('refuses a second dispatch while the first is in flight', () => {
    expect(buildRemindersView(translate, input({ isDispatching: true })).canDispatch).toBe(false);
  });

  /**
   * Between a dispatch settling and its status re-read landing, the screen
   * still holds the PRE-send counts. Enabling the button there invites a
   * second send against numbers already spent.
   */
  it('refuses a dispatch while the status is being re-read', () => {
    expect(buildRemindersView(translate, input({ isRefreshing: true })).canDispatch).toBe(false);
  });

  it('refuses a dispatch the window has closed on', () => {
    expect(
      buildRemindersView(translate, input({ status: status({ cutoff: true }) })).canDispatch,
    ).toBe(false);
  });

  it('passes the state flags and messages straight through', () => {
    const messages = [{ id: 'm1', text: 'queued' }];
    const view = buildRemindersView(
      translate,
      input({ isLoading: true, isForbidden: true, hasError: true, messages }),
    );

    expect(view.isLoading).toBe(true);
    expect(view.isForbidden).toBe(true);
    expect(view.hasError).toBe(true);
    expect(view.messages).toBe(messages);
  });
});
