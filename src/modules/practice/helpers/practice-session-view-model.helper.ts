import { formatCairoDateTime } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  PRACTICE_STATUS,
  PRACTICE_STATUS_LABEL_KEYS,
  PRACTICE_TYPE_LABEL_KEYS,
  PRACTICE_CHANGE_LABEL_KEYS,
} from '../constants/practice.constants';
import { sessionStatusTone } from './practice-calendar-view-model.helper';
import { buildRsvpControlData } from './rsvp-view-model.helper';
import type {
  PracticeAgendaItemView,
  PracticeCountView,
  PracticeDetailRowView,
  PracticeSessionDetailData,
  PracticeSessionStatus,
  PracticeVenueView,
} from '../types/practice-view.types';
import type {
  PracticeAgendaItem,
  PracticeSessionCounts,
  PracticeSessionDetail,
  PracticeVenue,
} from '../types/practice.types';

type Translate = (key: string, params?: TranslateParams) => string;

function buildScheduleRows(
  t: Translate,
  locale: string,
  detail: PracticeSessionDetail,
): readonly PracticeDetailRowView[] {
  const rows: PracticeDetailRowView[] = [];
  if (detail.meetAtIso !== null) {
    rows.push({
      key: 'meet',
      label: t(I18N_KEYS.practice.meetLabel),
      value: formatCairoDateTime(detail.meetAtIso, locale),
    });
  }
  rows.push({
    key: 'start',
    label: t(I18N_KEYS.practice.startLabel),
    value: formatCairoDateTime(detail.startAtIso, locale),
  });
  rows.push({
    key: 'end',
    label: t(I18N_KEYS.practice.endLabel),
    value: formatCairoDateTime(detail.endAtIso, locale),
  });
  return rows;
}

function buildVenueView(t: Translate, venue: PracticeVenue | null): PracticeVenueView | null {
  if (venue === null) {
    return null;
  }
  return {
    name: venue.name,
    addressLine: venue.addressLine,
    mapUrl: venue.mapUrl,
    directionsLabel: t(I18N_KEYS.practice.venueDirections),
    notesHeading: t(I18N_KEYS.practice.venueNotesHeading),
    notes: venue.notes,
  };
}

function buildAgendaView(
  t: Translate,
  agenda: readonly PracticeAgendaItem[],
): readonly PracticeAgendaItemView[] {
  return agenda.map((item) => ({
    id: item.id,
    label: t(item.labelKey),
    durationLabel:
      item.durationMinutes === null
        ? null
        : t(I18N_KEYS.practice.agendaDuration, { minutes: item.durationMinutes }),
  }));
}

function buildCountsView(
  t: Translate,
  counts: PracticeSessionCounts | null,
): readonly PracticeCountView[] | null {
  if (counts === null) {
    return null;
  }
  return [
    { key: 'going', label: t(I18N_KEYS.practice.countGoing), countText: String(counts.going) },
    { key: 'maybe', label: t(I18N_KEYS.practice.countMaybe), countText: String(counts.maybe) },
    {
      key: 'notGoing',
      label: t(I18N_KEYS.practice.countNotGoing),
      countText: String(counts.notGoing),
    },
    {
      key: 'waitlist',
      label: t(I18N_KEYS.practice.countWaitlist),
      countText: String(counts.waitlist),
    },
  ];
}

function buildCapacityLabel(t: Translate, capacity: number | null): string {
  return capacity === null
    ? t(I18N_KEYS.practice.capacityUnlimited)
    : t(I18N_KEYS.practice.capacityLabel, { count: capacity });
}

export interface PracticeSessionDetailDataParams {
  readonly t: Translate;
  readonly locale: string;
  readonly detail: PracticeSessionDetail;
  readonly nowIso: string;
  readonly canRsvpSelf: boolean;
}

/** Pure translated detail model (Cairo-time), including the RSVP control data. */
export function buildPracticeSessionDetailData(
  params: PracticeSessionDetailDataParams,
): PracticeSessionDetailData {
  const { t, locale, detail, nowIso, canRsvpSelf } = params;
  const typeLabel = t(PRACTICE_TYPE_LABEL_KEYS[detail.type]);
  const hasChange = detail.changeKind !== null;
  return {
    title: detail.title ?? typeLabel,
    typeLabel,
    statusLabel: t(PRACTICE_STATUS_LABEL_KEYS[detail.status]),
    statusTone: sessionStatusTone(detail.status),
    isCancelled: detail.status === PRACTICE_STATUS.cancelled,
    changeHeading: hasChange ? t(I18N_KEYS.practice.changedHeading) : null,
    changeMessage:
      detail.changeKind === null ? null : t(PRACTICE_CHANGE_LABEL_KEYS[detail.changeKind]),
    scheduleHeading: t(I18N_KEYS.practice.scheduleHeading),
    scheduleRows: buildScheduleRows(t, locale, detail),
    capacityLabel: buildCapacityLabel(t, detail.capacity),
    venueHeading: t(I18N_KEYS.practice.venueHeading),
    venue: buildVenueView(t, detail.venue),
    venueTbdLabel: t(I18N_KEYS.practice.venueTbd),
    instructionsHeading: t(I18N_KEYS.practice.instructionsHeading),
    instructions: detail.instructions,
    agendaHeading: t(I18N_KEYS.practice.agendaHeading),
    agendaEmptyLabel: t(I18N_KEYS.practice.agendaEmpty),
    agenda: buildAgendaView(t, detail.agenda),
    countsHeading: t(I18N_KEYS.practice.countsHeading),
    counts: buildCountsView(t, detail.counts),
    countsPrivateLabel: t(I18N_KEYS.practice.countsPrivate),
    updatedLabel: t(I18N_KEYS.practice.updatedAt, {
      when: formatCairoDateTime(detail.updatedAtIso, locale),
    }),
    subscriptionHeading: t(I18N_KEYS.practice.subscriptionHeading),
    subscriptionBody: t(I18N_KEYS.practice.subscriptionBody),
    rsvp: buildRsvpControlData({ t, locale, detail, nowIso, canRsvpSelf }),
  };
}

/** Pure state machine deciding which single detail state to present. */
export function resolvePracticeSessionStatus(params: {
  readonly hasData: boolean;
  readonly isLoading: boolean;
  readonly isForbidden: boolean;
  readonly isNotFound: boolean;
  readonly hasError: boolean;
  readonly isOffline: boolean;
}): PracticeSessionStatus {
  if (params.isForbidden) {
    return 'forbidden';
  }
  if (params.hasData) {
    return 'ready';
  }
  if (params.isOffline) {
    return 'offline';
  }
  if (params.isLoading) {
    return 'loading';
  }
  if (params.hasError || params.isNotFound) {
    return 'error';
  }
  return 'empty';
}
