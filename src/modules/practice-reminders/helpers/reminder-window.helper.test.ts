import { describe, expect, it } from 'vitest';

import { I18N_KEYS } from '@/shared/i18n';

import type { ReminderStatus } from '../types/practice-reminders.types';
import {
  canDispatchReminders,
  countHeldBack,
  resolveReminderWindowKey,
} from './reminder-window.helper';

function status(overrides: Partial<ReminderStatus> = {}): ReminderStatus {
  return {
    sessionId: 'session-1',
    totalEligible: 15,
    noResponse: 4,
    upcoming: true,
    cutoff: false,
    urgentCancellationOverride: false,
    kinds: ['rsvp_reminder'],
    ...overrides,
  };
}

describe('resolveReminderWindowKey', () => {
  it('states the session is over before anything about the window', () => {
    // Once the session has happened the cutoff is irrelevant, so a past
    // session must not be described as "the window is open".
    expect(resolveReminderWindowKey(status({ upcoming: false, cutoff: false }))).toBe(
      I18N_KEYS.practiceReminders.sessionPast,
    );
    expect(
      resolveReminderWindowKey(
        status({ upcoming: false, cutoff: true, urgentCancellationOverride: true }),
      ),
    ).toBe(I18N_KEYS.practiceReminders.sessionPast);
  });

  it('reports an open window before the cutoff', () => {
    expect(resolveReminderWindowKey(status({ cutoff: false }))).toBe(
      I18N_KEYS.practiceReminders.windowOpen,
    );
  });

  it('reports a closed window after the cutoff', () => {
    expect(resolveReminderWindowKey(status({ cutoff: true }))).toBe(
      I18N_KEYS.practiceReminders.windowClosed,
    );
  });

  /**
   * The override only means something once the cutoff has passed: a late
   * cancellation reopens a closed window, it does not reopen an open one.
   */
  it('reports a reopened window only when the cutoff has passed', () => {
    expect(
      resolveReminderWindowKey(status({ cutoff: true, urgentCancellationOverride: true })),
    ).toBe(I18N_KEYS.practiceReminders.windowReopened);
    expect(
      resolveReminderWindowKey(status({ cutoff: false, urgentCancellationOverride: true })),
    ).toBe(I18N_KEYS.practiceReminders.windowOpen);
  });
});

describe('canDispatchReminders', () => {
  it('allows a send while the window is open and something is due', () => {
    expect(canDispatchReminders(status())).toBe(true);
  });

  it('refuses once the session is over', () => {
    expect(canDispatchReminders(status({ upcoming: false }))).toBe(false);
  });

  /**
   * Offering a button that can only report "queued 0" is worse than no button:
   * it reads as a failure the coach caused.
   */
  it('refuses when nothing is due', () => {
    expect(canDispatchReminders(status({ kinds: [] }))).toBe(false);
  });

  it('refuses past the cutoff, unless a late cancellation reopened it', () => {
    expect(canDispatchReminders(status({ cutoff: true }))).toBe(false);
    expect(canDispatchReminders(status({ cutoff: true, urgentCancellationOverride: true }))).toBe(
      true,
    );
  });
});

describe('countHeldBack', () => {
  it('is the gap between candidates and what was queued', () => {
    expect(countHeldBack(15, 12)).toBe(3);
    expect(countHeldBack(15, 15)).toBe(0);
  });

  // Defensive: a server that ever reported more enqueued than candidates must
  // not produce a negative "held back" count in the copy.
  it('never reports a negative hold-back', () => {
    expect(countHeldBack(3, 5)).toBe(0);
  });
});
