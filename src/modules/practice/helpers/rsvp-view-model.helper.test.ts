import { describe, expect, it } from 'vitest';

import type { TranslateParams } from '@/packages/i18n';

import {
  buildPracticeSessionDetail,
  buildRsvpState,
} from '../../../../tests/factories/practice.factory';
import { PRACTICE_STATUS, RSVP_STATUS } from '../constants/practice.constants';
import { buildRsvpControlData } from './rsvp-view-model.helper';

const t = (key: string, params?: TranslateParams): string =>
  params === undefined ? key : `${key}|${JSON.stringify(params)}`;

const NOW = '2026-07-25T00:00:00.000Z';

describe('buildRsvpControlData', () => {
  it('is fully interactive when open, before the deadline, with permission', () => {
    const data = buildRsvpControlData({
      t,
      locale: 'en',
      detail: buildPracticeSessionDetail(),
      nowIso: NOW,
      canRsvpSelf: true,
    });

    expect(data.canRespond).toBe(true);
    expect(data.showReason).toBe(true);
    expect(data.options).toHaveLength(3);
    expect(data.disabledExplanation).toBeNull();
    expect(data.deadlineLabel?.startsWith('practice.rsvpDeadlineLabel')).toBe(true);
    expect(data.reasonOptions.length).toBeGreaterThan(0);
  });

  it('marks the active option and current status', () => {
    const detail = buildPracticeSessionDetail({
      rsvp: buildRsvpState({ status: RSVP_STATUS.going }),
    });

    const data = buildRsvpControlData({ t, locale: 'en', detail, nowIso: NOW, canRsvpSelf: true });

    expect(data.currentStatusLabel).toBe('practice.rsvpGoing');
    expect(data.currentStatusTone).toBe('success');
    expect(data.options.find((option) => option.value === RSVP_STATUS.going)?.isActive).toBe(true);
  });

  it('closes responses after the deadline with an explanation', () => {
    const detail = buildPracticeSessionDetail({
      rsvp: buildRsvpState({ deadlineAtIso: '2026-07-24T00:00:00.000Z' }),
    });

    const data = buildRsvpControlData({ t, locale: 'en', detail, nowIso: NOW, canRsvpSelf: true });

    expect(data.canRespond).toBe(false);
    expect(data.showReason).toBe(false);
    expect(data.disabledExplanation).toBe('practice.rsvpDeadlinePassed');
    expect(data.deadlineLabel).toBeNull();
  });

  it('closes responses for a cancelled session', () => {
    const detail = buildPracticeSessionDetail({ status: PRACTICE_STATUS.cancelled });

    const data = buildRsvpControlData({ t, locale: 'en', detail, nowIso: NOW, canRsvpSelf: true });

    expect(data.disabledExplanation).toBe('practice.rsvpCancelledNotice');
  });

  it('closes responses when the backend policy forbids it', () => {
    const detail = buildPracticeSessionDetail({ rsvp: buildRsvpState({ canRespond: false }) });

    const data = buildRsvpControlData({ t, locale: 'en', detail, nowIso: NOW, canRsvpSelf: true });

    expect(data.disabledExplanation).toBe('practice.rsvpClosed');
  });

  it('closes responses when the member lacks the self-RSVP permission', () => {
    const data = buildRsvpControlData({
      t,
      locale: 'en',
      detail: buildPracticeSessionDetail(),
      nowIso: NOW,
      canRsvpSelf: false,
    });

    expect(data.canRespond).toBe(false);
    expect(data.disabledExplanation).toBe('practice.rsvpClosed');
  });

  it('drops the deadline label when there is no deadline', () => {
    const detail = buildPracticeSessionDetail({ rsvp: buildRsvpState({ deadlineAtIso: null }) });

    const data = buildRsvpControlData({ t, locale: 'en', detail, nowIso: NOW, canRsvpSelf: true });

    expect(data.deadlineLabel).toBeNull();
  });

  it('shows a positioned waitlist notice', () => {
    const detail = buildPracticeSessionDetail({
      rsvp: buildRsvpState({ waitlisted: true, waitlistPosition: 3 }),
    });

    const data = buildRsvpControlData({ t, locale: 'en', detail, nowIso: NOW, canRsvpSelf: true });

    expect(data.waitlistLabel).toBe('practice.waitlistNotice|{"position":3}');
  });

  it('shows a position-less waitlist notice', () => {
    const detail = buildPracticeSessionDetail({
      rsvp: buildRsvpState({ waitlisted: true, waitlistPosition: null }),
    });

    const data = buildRsvpControlData({ t, locale: 'en', detail, nowIso: NOW, canRsvpSelf: true });

    expect(data.waitlistLabel).toBe('practice.waitlistNoticeNoPosition');
  });

  it('shows no waitlist notice when not waitlisted', () => {
    const data = buildRsvpControlData({
      t,
      locale: 'en',
      detail: buildPracticeSessionDetail(),
      nowIso: NOW,
      canRsvpSelf: true,
    });

    expect(data.waitlistLabel).toBeNull();
  });
});
