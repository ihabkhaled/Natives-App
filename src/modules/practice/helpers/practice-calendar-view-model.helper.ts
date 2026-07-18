import { cairoDayKey, formatCairoTime, formatCairoWeekdayDate } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  PRACTICE_CHANGE_LABEL_KEYS,
  PRACTICE_STATUS,
  PRACTICE_STATUS_LABEL_KEYS,
  PRACTICE_TYPE_LABEL_KEYS,
  RSVP_STATUS,
  RSVP_STATUS_LABEL_KEYS,
  type RsvpStatus,
} from '../constants/practice.constants';
import type {
  PracticeCalendarStatus,
  PracticeDaySectionView,
  PracticeSessionCardView,
} from '../types/practice-view.types';
import type { PracticeSessionSummary } from '../types/practice.types';

type Translate = (key: string, params?: TranslateParams) => string;

interface MutableDaySection {
  readonly dayKey: string;
  readonly dayLabel: string;
  readonly sessions: PracticeSessionCardView[];
}

/** Ionic colour for an RSVP status chip. */
export function rsvpTone(status: RsvpStatus): string {
  if (status === RSVP_STATUS.going) {
    return 'success';
  }
  if (status === RSVP_STATUS.maybe) {
    return 'warning';
  }
  return 'medium';
}

/** Ionic colour for a session lifecycle status. */
export function sessionStatusTone(status: PracticeSessionSummary['status']): string {
  if (status === PRACTICE_STATUS.cancelled) {
    return 'danger';
  }
  if (status === PRACTICE_STATUS.rescheduled) {
    return 'warning';
  }
  return 'medium';
}

/** Pure translated view for one calendar list item (Cairo-time start). */
export function buildSessionCardView(
  t: Translate,
  locale: string,
  session: PracticeSessionSummary,
): PracticeSessionCardView {
  const typeLabel = t(PRACTICE_TYPE_LABEL_KEYS[session.type]);
  return {
    id: session.id,
    title: session.title ?? typeLabel,
    typeLabel,
    statusLabel: t(PRACTICE_STATUS_LABEL_KEYS[session.status]),
    statusTone: sessionStatusTone(session.status),
    showStatusBadge: session.status !== PRACTICE_STATUS.scheduled,
    isCancelled: session.status === PRACTICE_STATUS.cancelled,
    timeLabel: formatCairoTime(session.startAtIso, locale),
    venueLabel: session.venueName,
    rsvpLabel: t(RSVP_STATUS_LABEL_KEYS[session.myRsvpStatus]),
    rsvpTone: rsvpTone(session.myRsvpStatus),
    changeLabel:
      session.changeKind === null ? null : t(PRACTICE_CHANGE_LABEL_KEYS[session.changeKind]),
    waitlistLabel: session.waitlisted ? t(I18N_KEYS.practice.waitlistNoticeNoPosition) : null,
  };
}

/**
 * Group sessions into Cairo-day sections, preserving the server's deterministic
 * ordering. A late-evening UTC instant lands on its correct local day.
 */
export function groupSessionsByDay(
  t: Translate,
  locale: string,
  sessions: readonly PracticeSessionSummary[],
): readonly PracticeDaySectionView[] {
  const sections: MutableDaySection[] = [];
  const index = new Map<string, MutableDaySection>();
  for (const session of sessions) {
    const dayKey = cairoDayKey(session.startAtIso);
    let section = index.get(dayKey);
    if (section === undefined) {
      section = {
        dayKey,
        dayLabel: formatCairoWeekdayDate(session.startAtIso, locale),
        sessions: [],
      };
      index.set(dayKey, section);
      sections.push(section);
    }
    section.sessions.push(buildSessionCardView(t, locale, session));
  }
  return sections;
}

/** Pure state machine deciding which single calendar state to present. */
export function resolvePracticeCalendarStatus(params: {
  readonly hasSessions: boolean;
  readonly hasData: boolean;
  readonly isLoading: boolean;
  readonly isForbidden: boolean;
  readonly hasError: boolean;
  readonly isOffline: boolean;
}): PracticeCalendarStatus {
  if (params.isForbidden) {
    return 'forbidden';
  }
  if (params.hasData) {
    return params.hasSessions ? 'ready' : 'empty';
  }
  if (params.isOffline) {
    return 'offline';
  }
  if (params.isLoading) {
    return 'loading';
  }
  if (params.hasError) {
    return 'error';
  }
  return 'empty';
}
