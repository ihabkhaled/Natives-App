import { describe, expect, it } from 'vitest';

import { formatScorePair } from '@/packages/number';
import { I18N_KEYS } from '@/shared/i18n';
import { buildMatchEvent } from '@/tests/msw/matches-domain.fixture';

import { MATCH_TIMELINE_LIMIT } from '../constants/matches.constants';
import { buildTimelineRows, selectUndoableEvent } from './match-timeline.helper';

const LOCALE = 'en';

const t = (key: string): string => key;

describe('buildTimelineRows', () => {
  it('renders the running score after each event', () => {
    const rows = buildTimelineRows(t, LOCALE, [buildMatchEvent()]);

    expect(rows[0]?.label).toBe(I18N_KEYS.scoreboard.timelinePoint);
    expect(rows[0]?.value).toBe(formatScorePair(8, 6, LOCALE));
    expect(rows[0]?.value).toContain('8 – 6');
    expect(rows[0]?.detail).toBeNull();
    expect(rows[0]?.tone).toBeNull();
  });

  it('keeps a voided event visible and marks it', () => {
    const rows = buildTimelineRows(t, LOCALE, [buildMatchEvent({ voided: true })]);

    expect(rows[0]?.detail).toBe(I18N_KEYS.scoreboard.timelineVoided);
    expect(rows[0]?.tone).toBe('warning');
  });

  it('shows the correction reason on the compensating event', () => {
    const rows = buildTimelineRows(t, LOCALE, [
      buildMatchEvent({ eventType: 'void', voidReason: 'wrong side' }),
    ]);

    expect(rows[0]?.label).toBe(I18N_KEYS.scoreboard.timelineVoid);
    expect(rows[0]?.detail).toBe('wrong side');
  });

  it('bounds the rendered timeline', () => {
    const events = Array.from({ length: MATCH_TIMELINE_LIMIT + 5 }, (_unused, index) =>
      buildMatchEvent({ eventId: `event-${String(index)}` }),
    );

    expect(buildTimelineRows(t, LOCALE, events)).toHaveLength(MATCH_TIMELINE_LIMIT);
  });
});

describe('selectUndoableEvent', () => {
  it('picks the newest point that has not already been corrected', () => {
    const events = [
      buildMatchEvent({ eventId: 'event-timeout', eventType: 'timeout' }),
      buildMatchEvent({ eventId: 'event-voided', voided: true }),
      buildMatchEvent({ eventId: 'event-live' }),
    ];

    expect(selectUndoableEvent(events)?.eventId).toBe('event-live');
  });

  it('returns null when nothing can be corrected', () => {
    expect(selectUndoableEvent([buildMatchEvent({ eventType: 'timeout' })])).toBeNull();
  });
});
