import { describe, expect, it } from 'vitest';

import type { TranslateParams } from '@/packages/i18n';

import { buildPracticeSessionDetail } from '../../../../tests/factories/practice.factory';
import { PRACTICE_TYPE } from '../constants/practice.constants';
import {
  buildPracticeSessionDetailData,
  resolvePracticeSessionStatus,
} from './practice-session-view-model.helper';

const t = (key: string, params?: TranslateParams): string =>
  params === undefined ? key : `${key}|${JSON.stringify(params)}`;

describe('buildPracticeSessionDetailData', () => {
  it('builds schedule rows including meet time when present', () => {
    const data = buildPracticeSessionDetailData({
      t,
      locale: 'en',
      detail: buildPracticeSessionDetail(),
      nowIso: 'x',
      canRsvpSelf: true,
    });

    expect(data.scheduleRows.map((row) => row.key)).toEqual(['meet', 'start', 'end']);
    expect(data.capacityLabel.startsWith('practice.capacityLabel')).toBe(true);
  });

  it('omits the meet row and shows unlimited capacity when absent', () => {
    const detail = buildPracticeSessionDetail({ meetAtIso: null, capacity: null });

    const data = buildPracticeSessionDetailData({
      t,
      locale: 'en',
      detail,
      nowIso: 'x',
      canRsvpSelf: true,
    });

    expect(data.scheduleRows.map((row) => row.key)).toEqual(['start', 'end']);
    expect(data.capacityLabel).toBe('practice.capacityUnlimited');
  });

  it('renders the venue, agenda durations, and privacy-safe counts', () => {
    const data = buildPracticeSessionDetailData({
      t,
      locale: 'en',
      detail: buildPracticeSessionDetail(),
      nowIso: 'x',
      canRsvpSelf: true,
    });

    expect(data.venue?.name).toBe('Zamalek Club Field');
    expect(data.agenda[0]?.durationLabel?.startsWith('practice.agendaDuration')).toBe(true);
    expect(data.counts).toHaveLength(4);
  });

  it('hides counts and venue when not provided, and durations when null', () => {
    const detail = buildPracticeSessionDetail({
      venue: null,
      counts: null,
      agenda: [{ id: 'a1', labelKey: 'practice.typeThrowing', durationMinutes: null }],
    });

    const data = buildPracticeSessionDetailData({
      t,
      locale: 'en',
      detail,
      nowIso: 'x',
      canRsvpSelf: true,
    });

    expect(data.venue).toBeNull();
    expect(data.counts).toBeNull();
    expect(data.agenda[0]?.durationLabel).toBeNull();
  });

  it('falls back to the type label and surfaces a change banner', () => {
    const detail = buildPracticeSessionDetail({ title: null, changeKind: 'venue_changed' });

    const data = buildPracticeSessionDetailData({
      t,
      locale: 'en',
      detail,
      nowIso: 'x',
      canRsvpSelf: true,
    });

    expect(data.title).toBe('practice.typePractice');
    expect(data.changeHeading).toBe('practice.changedHeading');
    expect(data.changeMessage).toBe('practice.changeVenue');
  });

  it('omits the change banner when nothing changed', () => {
    const detail = buildPracticeSessionDetail({ type: PRACTICE_TYPE.fitness, changeKind: null });

    const data = buildPracticeSessionDetailData({
      t,
      locale: 'en',
      detail,
      nowIso: 'x',
      canRsvpSelf: true,
    });

    expect(data.changeHeading).toBeNull();
    expect(data.changeMessage).toBeNull();
  });
});

describe('resolvePracticeSessionStatus', () => {
  const base = {
    hasData: false,
    isLoading: false,
    isForbidden: false,
    isNotFound: false,
    hasError: false,
    isOffline: false,
  };

  it('prioritises forbidden', () => {
    expect(resolvePracticeSessionStatus({ ...base, isForbidden: true })).toBe('forbidden');
  });

  it('is ready with data', () => {
    expect(resolvePracticeSessionStatus({ ...base, hasData: true })).toBe('ready');
  });

  it('is offline without data', () => {
    expect(resolvePracticeSessionStatus({ ...base, isOffline: true })).toBe('offline');
  });

  it('is loading without data', () => {
    expect(resolvePracticeSessionStatus({ ...base, isLoading: true })).toBe('loading');
  });

  it('is error on a failure', () => {
    expect(resolvePracticeSessionStatus({ ...base, hasError: true })).toBe('error');
  });

  it('is error on a not-found', () => {
    expect(resolvePracticeSessionStatus({ ...base, isNotFound: true })).toBe('error');
  });

  it('is empty by default', () => {
    expect(resolvePracticeSessionStatus(base)).toBe('empty');
  });
});
