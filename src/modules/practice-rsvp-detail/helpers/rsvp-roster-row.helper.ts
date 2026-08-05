import { formatCairoDateTime } from '@/packages/date';
import type { TranslateParams } from '@/packages/i18n';
import { I18N_KEYS } from '@/shared/i18n';

import {
  RSVP_SOURCE_LABEL_KEYS,
  RSVP_STATUS_LABEL_KEYS,
  RSVP_STATUS_TONE,
} from '../constants/practice-rsvp-detail-copy.constants';
import type { RsvpRosterRowView } from '../types/practice-rsvp-detail-view.types';
import type { RsvpParticipant } from '../types/practice-rsvp-detail.types';

type Translate = (key: string, params?: TranslateParams) => string;

/** The two actions every roster row offers, addressed by membership id. */
export interface RosterRowActions {
  readonly onOverride: (membershipId: string) => void;
  readonly onViewHistory: (membershipId: string) => void;
}

/**
 * The row's secondary line: when a member is waitlisted, that outranks the
 * response time as the thing worth a coach's attention.
 */
function buildDetailLabel(t: Translate, locale: string, participant: RsvpParticipant): string {
  const respondedAtLabel = formatCairoDateTime(participant.respondedAtIso, locale);
  if (!participant.waitlisted) {
    return respondedAtLabel;
  }
  return `${respondedAtLabel} · ${t(I18N_KEYS.practiceRsvpDetail.rowWaitlisted)}`;
}

/**
 * One roster row, translated and wired to its own actions.
 *
 * `idLabel` renders the membership id itself: the contract's participant
 * shape carries no display name, so showing anything richer here would be
 * inventing data the read never returned.
 */
export function buildRosterRow(
  t: Translate,
  locale: string,
  participant: RsvpParticipant,
  actions: RosterRowActions,
): RsvpRosterRowView {
  return {
    membershipId: participant.membershipId,
    idLabel: participant.membershipId,
    statusLabel: t(RSVP_STATUS_LABEL_KEYS[participant.status]),
    statusTone: RSVP_STATUS_TONE[participant.status],
    sourceLabel: t(RSVP_SOURCE_LABEL_KEYS[participant.source]),
    respondedAtLabel: formatCairoDateTime(participant.respondedAtIso, locale),
    detailLabel: buildDetailLabel(t, locale, participant),
    waitlistedLabel: participant.waitlisted ? t(I18N_KEYS.practiceRsvpDetail.rowWaitlisted) : null,
    overrideLabel: t(I18N_KEYS.practiceRsvpDetail.overrideRowAction),
    historyLabel: t(I18N_KEYS.practiceRsvpDetail.historyRowAction),
    onOverride: () => {
      actions.onOverride(participant.membershipId);
    },
    onViewHistory: () => {
      actions.onViewHistory(participant.membershipId);
    },
  };
}

/** One page of roster rows, in the order the server returned them. */
export function buildRosterRows(
  t: Translate,
  locale: string,
  participants: readonly RsvpParticipant[],
  actions: RosterRowActions,
): readonly RsvpRosterRowView[] {
  return participants.map((participant) => buildRosterRow(t, locale, participant, actions));
}
