import { formatScorePair } from '@/packages/number';
import { I18N_KEYS } from '@/shared/i18n';

import { MATCH_EVENT_LABEL_KEYS } from '../constants/matches-labels.constants';
import { MATCH_TIMELINE_LIMIT } from '../constants/matches.constants';
import type { MatchEvent } from '../types/matches.types';
import type { TimelineRowView } from '../types/matches-view.types';

type Translate = (key: string, params?: Record<string, string | number>) => string;

function eventDetail(t: Translate, event: MatchEvent): string | null {
  if (event.voided) {
    return t(I18N_KEYS.scoreboard.timelineVoided);
  }
  return event.voidReason;
}

/**
 * The append-only stream as rows. A voided event stays visible with its
 * correction reason attached: an undo appends a compensating event, it never
 * rewrites or removes the original.
 */
export function buildTimelineRows(
  t: Translate,
  locale: string,
  events: readonly MatchEvent[],
): readonly TimelineRowView[] {
  return events.slice(0, MATCH_TIMELINE_LIMIT).map((event) => ({
    key: event.eventId,
    label: t(MATCH_EVENT_LABEL_KEYS[event.eventType]),
    value: formatScorePair(event.ourScoreAfter, event.opponentScoreAfter, locale),
    detail: eventDetail(t, event),
    tone: event.voided ? 'warning' : null,
  }));
}

/**
 * The event an undo compensates: the newest point that has not already been
 * voided. Timeouts and period markers are never "undone" this way.
 */
export function selectUndoableEvent(events: readonly MatchEvent[]): MatchEvent | null {
  return events.find((event) => event.eventType === 'point' && !event.voided) ?? null;
}
