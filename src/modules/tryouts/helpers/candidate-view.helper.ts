import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  CANDIDATE_STATUS_LABEL_KEYS,
  CANDIDATE_STATUS_TONES,
  EVENT_STATUS_LABEL_KEYS,
  EVENT_STATUS_TONES,
} from '../constants/tryouts-labels.constants';
import { ALL_CANDIDATES_FILTER, CANDIDATE_STATUSES } from '../constants/tryouts.constants';
import type { CandidateDetail, CandidateSummary, TryoutEvent } from '../types/tryouts.types';
import type {
  CandidateRowView,
  RestrictedBlockView,
  TryoutCardView,
  TryoutFactView,
  TryoutsOption,
} from '../types/tryouts-view.types';

type Translate = (key: string, params?: TranslateParams) => string;

export function buildTryoutCard(
  t: Translate,
  formatInstant: (iso: string) => string,
  event: TryoutEvent,
): TryoutCardView {
  return {
    id: event.tryoutId,
    name: event.name,
    statusLabel: t(EVENT_STATUS_LABEL_KEYS[event.status]),
    statusTone: EVENT_STATUS_TONES[event.status],
    heldAtLabel: formatInstant(event.heldAt),
    capacityLabel: t(I18N_KEYS.tryouts.capacitySummary, {
      registered: event.registeredCount,
      capacity: event.capacity,
    }),
    waitlistLabel: t(I18N_KEYS.tryouts.waitlistSummary, { count: event.waitlistedCount }),
    openLabel: t(I18N_KEYS.tryouts.openLabel),
  };
}

export interface TryoutHeadline {
  readonly heading: string;
  readonly statusLabel: string;
  readonly statusTone: string;
}

/** The event header, resolved once from a nullable record. */
export function buildTryoutHeadline(t: Translate, event: TryoutEvent | null): TryoutHeadline {
  return event === null
    ? { heading: t(I18N_KEYS.tryouts.detailTitle), statusLabel: '', statusTone: 'medium' }
    : {
        heading: event.name,
        statusLabel: t(EVENT_STATUS_LABEL_KEYS[event.status]),
        statusTone: EVENT_STATUS_TONES[event.status],
      };
}

export function buildTryoutFacts(
  t: Translate,
  formatInstant: (iso: string) => string,
  event: TryoutEvent | null,
): readonly TryoutFactView[] {
  if (event === null) {
    return [];
  }
  return [
    { key: 'held', label: t(I18N_KEYS.tryouts.windowLabel), value: formatInstant(event.heldAt) },
    {
      key: 'capacity',
      label: t(I18N_KEYS.tryouts.capacityLabel),
      value: t(I18N_KEYS.tryouts.capacitySummary, {
        registered: event.registeredCount,
        capacity: event.capacity,
      }),
    },
    {
      key: 'waitlist',
      label: t(I18N_KEYS.tryouts.statusWaitlisted),
      value: t(I18N_KEYS.tryouts.waitlistSummary, { count: event.waitlistedCount }),
    },
  ];
}

/** Only a registered or waitlisted candidate can still be checked in. */
export function canCheckIn(candidate: CandidateSummary): boolean {
  return candidate.status === 'registered' || candidate.status === 'waitlisted';
}

export function buildCandidateRow(
  t: Translate,
  formatInstant: (iso: string) => string,
  candidate: CandidateSummary,
  selectedId: string,
): CandidateRowView {
  return {
    candidateId: candidate.candidateId,
    reference: candidate.reference,
    displayName: candidate.displayName,
    statusLabel: t(CANDIDATE_STATUS_LABEL_KEYS[candidate.status]),
    statusTone: CANDIDATE_STATUS_TONES[candidate.status],
    checkedInLabel:
      candidate.checkedInAt === null
        ? null
        : t(I18N_KEYS.tryouts.checkedInAt, { time: formatInstant(candidate.checkedInAt) }),
    canCheckIn: canCheckIn(candidate),
    checkInLabel: t(I18N_KEYS.tryouts.checkInLabel),
    openLabel: t(I18N_KEYS.tryouts.openLabel),
    isSelected: candidate.candidateId === selectedId,
  };
}

export function buildCandidateStatusOptions(t: Translate): readonly TryoutsOption[] {
  return [
    { value: ALL_CANDIDATES_FILTER, label: t(I18N_KEYS.tryouts.filterAll) },
    ...CANDIDATE_STATUSES.map((status) => ({
      value: status,
      label: t(CANDIDATE_STATUS_LABEL_KEYS[status]),
    })),
  ];
}

/**
 * Contact details are shown only when the caller holds
 * `tryout.contacts.read` AND the server actually returned the block. Both
 * conditions must hold, so a permissive client cannot invent data.
 */
export function buildContactsBlock(
  t: Translate,
  detail: CandidateDetail,
  isPermitted: boolean,
): RestrictedBlockView {
  const contacts = detail.contacts;
  const facts: TryoutFactView[] =
    contacts === null || !isPermitted
      ? []
      : [
          {
            key: 'email',
            label: t(I18N_KEYS.tryouts.contactEmailLabel),
            value: contacts.email,
          },
          {
            key: 'phone',
            label: t(I18N_KEYS.tryouts.contactPhoneLabel),
            value: contacts.phone ?? t(I18N_KEYS.tryouts.readinessNone),
          },
        ];
  return {
    heading: t(I18N_KEYS.tryouts.contactsHeading),
    isPermitted: isPermitted && contacts !== null,
    restrictedTitle: t(I18N_KEYS.tryouts.contactsRestrictedTitle),
    restrictedMessage: t(I18N_KEYS.tryouts.contactsRestrictedMessage),
    notice: t(I18N_KEYS.tryouts.contactsAuditNotice),
    facts,
  };
}

/** Readiness and health notes follow the same two-condition rule. */
export function buildReadinessBlock(
  t: Translate,
  detail: CandidateDetail,
  isPermitted: boolean,
): RestrictedBlockView {
  const readiness = detail.readiness;
  const facts: TryoutFactView[] =
    readiness === null || !isPermitted
      ? []
      : [
          {
            key: 'note',
            label: t(I18N_KEYS.tryouts.readinessNotesLabel),
            value: readiness.note ?? t(I18N_KEYS.tryouts.readinessNone),
          },
        ];
  return {
    heading: t(I18N_KEYS.tryouts.readinessHeading),
    isPermitted: isPermitted && readiness !== null,
    restrictedTitle: t(I18N_KEYS.tryouts.readinessRestrictedTitle),
    restrictedMessage: t(I18N_KEYS.tryouts.readinessRestrictedMessage),
    notice: t(I18N_KEYS.tryouts.readinessExportNotice),
    facts,
  };
}
