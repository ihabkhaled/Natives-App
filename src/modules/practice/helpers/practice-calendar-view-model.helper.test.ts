import { describe, expect, it } from 'vitest';

import { buildPracticeSessionSummary } from '../../../../tests/factories/practice.factory';
import { PRACTICE_STATUS, RSVP_STATUS } from '../constants/practice.constants';
import {
  buildSessionCardView,
  groupSessionsByDay,
  resolvePracticeCalendarStatus,
  rsvpTone,
  sessionStatusTone,
} from './practice-calendar-view-model.helper';

const t = (key: string): string => key;

describe('rsvpTone', () => {
  it('colours each response status', () => {
    expect(rsvpTone(RSVP_STATUS.going)).toBe('success');
    expect(rsvpTone(RSVP_STATUS.maybe)).toBe('warning');
    expect(rsvpTone(RSVP_STATUS.notGoing)).toBe('medium');
  });
});

describe('sessionStatusTone', () => {
  it('colours each lifecycle status', () => {
    expect(sessionStatusTone(PRACTICE_STATUS.cancelled)).toBe('danger');
    expect(sessionStatusTone(PRACTICE_STATUS.rescheduled)).toBe('warning');
    expect(sessionStatusTone(PRACTICE_STATUS.scheduled)).toBe('medium');
  });
});

describe('buildSessionCardView', () => {
  it('uses the session title when present', () => {
    const card = buildSessionCardView(t, 'en', buildPracticeSessionSummary({ title: 'Scrimmage' }));

    expect(card.title).toBe('Scrimmage');
    expect(card.showStatusBadge).toBe(false);
    expect(card.timeLabel.length).toBeGreaterThan(0);
  });

  it('falls back to the type label when the title is null', () => {
    const card = buildSessionCardView(t, 'en', buildPracticeSessionSummary({ title: null }));

    expect(card.title).toBe('practice.typePractice');
  });

  it('surfaces change, waitlist, and cancellation cues', () => {
    const card = buildSessionCardView(
      t,
      'en',
      buildPracticeSessionSummary({
        status: PRACTICE_STATUS.cancelled,
        changeKind: 'cancelled',
        waitlisted: true,
        venueName: null,
      }),
    );

    expect(card.isCancelled).toBe(true);
    expect(card.showStatusBadge).toBe(true);
    expect(card.changeLabel).toBe('practice.changeCancelled');
    expect(card.waitlistLabel).toBe('practice.waitlistNoticeNoPosition');
    expect(card.venueLabel).toBeNull();
  });

  it('omits change and waitlist cues when absent', () => {
    const card = buildSessionCardView(t, 'en', buildPracticeSessionSummary({ waitlisted: false }));

    expect(card.changeLabel).toBeNull();
    expect(card.waitlistLabel).toBeNull();
  });
});

describe('groupSessionsByDay', () => {
  it('groups same-Cairo-day sessions into one section', () => {
    const sections = groupSessionsByDay(t, 'en', [
      buildPracticeSessionSummary({ id: 'a', startAtIso: '2026-07-26T13:00:00.000Z' }),
      buildPracticeSessionSummary({ id: 'b', startAtIso: '2026-07-26T16:00:00.000Z' }),
    ]);

    expect(sections).toHaveLength(1);
    expect(sections[0]?.sessions).toHaveLength(2);
    expect(sections[0]?.dayKey).toBe('2026-07-26');
  });

  it('splits sessions across Cairo day boundaries', () => {
    const sections = groupSessionsByDay(t, 'en', [
      buildPracticeSessionSummary({ id: 'a', startAtIso: '2026-07-26T13:00:00.000Z' }),
      // 22:30Z is 01:30 next day in Cairo (UTC+3 in July)
      buildPracticeSessionSummary({ id: 'b', startAtIso: '2026-07-26T22:30:00.000Z' }),
    ]);

    expect(sections).toHaveLength(2);
    expect(sections[1]?.dayKey).toBe('2026-07-27');
  });

  it('returns no sections for an empty list', () => {
    expect(groupSessionsByDay(t, 'en', [])).toEqual([]);
  });
});

describe('resolvePracticeCalendarStatus', () => {
  const base = {
    hasSessions: false,
    hasData: false,
    isLoading: false,
    isForbidden: false,
    hasError: false,
    isOffline: false,
  };

  it('prioritises forbidden', () => {
    expect(resolvePracticeCalendarStatus({ ...base, isForbidden: true })).toBe('forbidden');
  });

  it('is ready with data and sessions', () => {
    expect(resolvePracticeCalendarStatus({ ...base, hasData: true, hasSessions: true })).toBe(
      'ready',
    );
  });

  it('is empty with data but no sessions', () => {
    expect(resolvePracticeCalendarStatus({ ...base, hasData: true })).toBe('empty');
  });

  it('prefers offline over loading and error when there is no data', () => {
    expect(
      resolvePracticeCalendarStatus({ ...base, isOffline: true, isLoading: true, hasError: true }),
    ).toBe('offline');
  });

  it('is loading while fetching the first page', () => {
    expect(resolvePracticeCalendarStatus({ ...base, isLoading: true })).toBe('loading');
  });

  it('is error when a fetch failed', () => {
    expect(resolvePracticeCalendarStatus({ ...base, hasError: true })).toBe('error');
  });

  it('is empty by default', () => {
    expect(resolvePracticeCalendarStatus(base)).toBe('empty');
  });
});
